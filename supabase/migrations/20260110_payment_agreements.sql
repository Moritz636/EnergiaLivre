-- =====================================================
-- ENERGIALIVRE — Migration 20260110
-- ACORDO LEGAL + COMISSOES + TAXA UFV
-- Fase C.2
-- =====================================================
-- Adiciona:
--   * Tabela payment_agreements (log de aceite, idempotente)
--   * Coluna profiles.agreed_to_payment_terms_at
--   * Coluna profiles.last_terms_version
--   * Novos tipos em comissoes: match, embaixador_5pct, ufv_15pct
--   * Coluna match_proposals.commissions_processed_at
--   * Coluna pagamentos.commissions_processed_at
--   * Coluna pagamentos.ufv_fee_paid
--   * RPC record_payment_agreement
--   * RPC process_match_commissions (20+20+20 moedas)
--   * RPC process_payment_commissions (5% embaixador + 15% UFV)
-- Idempotente. Requer: coin_system + match_member_plus.
-- =====================================================

-- =====================================================
-- 1. TABELA: PAYMENT_AGREEMENTS (LOG DE ACEITE)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    terms_version TEXT NOT NULL,
    terms_hash TEXT NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    document_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_agreements_user
    ON payment_agreements(user_id, accepted_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_agreements_version
    ON payment_agreements(terms_version);

ALTER TABLE payment_agreements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own agreements" ON payment_agreements;
CREATE POLICY "Users can view own agreements" ON payment_agreements
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own agreements" ON payment_agreements;
CREATE POLICY "Users can insert own agreements" ON payment_agreements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. COLUNAS EM PROFILES
-- =====================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS agreed_to_payment_terms_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_terms_version TEXT;

-- =====================================================
-- 3. EXPANDIR TIPOS DE COMISSAO
-- =====================================================
-- O CHECK em comissoes ja existe com enum (cadastro, recorrente).
-- Precisamos adicionar match, embaixador_5pct, ufv_15pct.
-- Solucao: recriar o CHECK com a lista nova.

DO $$
DECLARE
    v_constraint_name TEXT;
BEGIN
    SELECT conname INTO v_constraint_name
    FROM pg_constraint
    WHERE conrelid = 'comissoes'::regclass
      AND pg_get_constraintdef(oid) LIKE '%tipo_comissao%'
    LIMIT 1;

    IF v_constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE comissoes DROP CONSTRAINT %I', v_constraint_name);
    END IF;
END $$;

ALTER TABLE comissoes
    ADD CONSTRAINT comissoes_tipo_comissao_check
    CHECK (tipo_comissao IN ('cadastro', 'recorrente', 'match', 'embaixador_5pct', 'ufv_15pct'));

-- =====================================================
-- 4. COLUNAS EM MATCH_PROPOSALS
-- =====================================================

ALTER TABLE match_proposals
    ADD COLUMN IF NOT EXISTS commissions_processed_at TIMESTAMPTZ;

-- =====================================================
-- 5. COLUNAS EM PAGAMENTOS
-- =====================================================

ALTER TABLE pagamentos
    ADD COLUMN IF NOT EXISTS commissions_processed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ufv_fee_paid BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS embaixador_fee_paid BOOLEAN NOT NULL DEFAULT false;

-- =====================================================
-- 6. RPC: RECORD_PAYMENT_AGREEMENT
-- =====================================================
-- Idempotente: mesmo (user, terms_version) so registra 1 vez.
-- Atualiza profiles.agreed_to_payment_terms_at.
-- =====================================================

CREATE OR REPLACE FUNCTION record_payment_agreement(
    p_user_id UUID,
    p_terms_version TEXT,
    p_terms_hash TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_document_url TEXT DEFAULT NULL
) RETURNS TABLE(already_accepted BOOLEAN, agreement_id UUID, accepted_at TIMESTAMPTZ) AS $$
DECLARE
    v_existing payment_agreements%ROWTYPE;
    v_new payment_agreements%ROWTYPE;
BEGIN
    -- Idempotencia: se ja aceitou esta versao, retorna sem inserir
    SELECT * INTO v_existing
    FROM payment_agreements
    WHERE user_id = p_user_id AND terms_version = p_terms_version
    ORDER BY accepted_at DESC
    LIMIT 1;

    IF v_existing.id IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, v_existing.id, v_existing.accepted_at;
        RETURN;
    END IF;

    -- Insere novo registro
    INSERT INTO payment_agreements (
        user_id, terms_version, terms_hash, ip_address, user_agent, document_url
    )
    VALUES (
        p_user_id, p_terms_version, p_terms_hash, p_ip_address, p_user_agent, p_document_url
    )
    RETURNING * INTO v_new;

    -- Atualiza profile com timestamp
    UPDATE profiles
    SET agreed_to_payment_terms_at = v_new.accepted_at,
        last_terms_version = p_terms_version
    WHERE id = p_user_id
      AND (agreed_to_payment_terms_at IS NULL
           OR last_terms_version IS DISTINCT FROM p_terms_version);

    RETURN QUERY SELECT FALSE, v_new.id, v_new.accepted_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RPC: PROCESS_MATCH_COMMISSIONS
-- =====================================================
-- Chamada quando match_proposal.status -> 'accepted'.
-- Credita 20 moedas para cada parte (from_user, to_user).
-- Se algum deles tem referred_by (embaixador que trouxe), credita
-- +20 moedas ao embaixador. Marca commissions_processed_at
-- para idempotencia. Idempotente.
-- =====================================================

CREATE OR REPLACE FUNCTION process_match_commissions(
    p_proposal_id BIGINT
) RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    coins_credited INTEGER,
    inviter_credited INTEGER
) AS $$
DECLARE
    v_proposal match_proposals%ROWTYPE;
    v_from_inviter UUID;
    v_to_inviter UUID;
    v_total_credited INTEGER := 0;
    v_inviter_credited INTEGER := 0;
    v_inviter_id UUID;
    v_result RECORD;
BEGIN
    -- Lock da proposal
    SELECT * INTO v_proposal
    FROM match_proposals
    WHERE id = p_proposal_id
    FOR UPDATE;

    IF v_proposal.id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Proposta nao encontrada'::TEXT, 0, 0;
        RETURN;
    END IF;

    -- Idempotencia
    IF v_proposal.commissions_processed_at IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, 'Comissoes ja processadas'::TEXT, 0, 0;
        RETURN;
    END IF;

    IF v_proposal.status <> 'accepted' THEN
        RETURN QUERY SELECT FALSE, 'Proposta nao esta aceita'::TEXT, 0, 0;
        RETURN;
    END IF;

    -- Garante wallets
    INSERT INTO coin_wallet (user_id, balance) VALUES (v_proposal.from_user_id, 0) ON CONFLICT DO NOTHING;
    INSERT INTO coin_wallet (user_id, balance) VALUES (v_proposal.to_user_id, 0) ON CONFLICT DO NOTHING;

    -- 20 moedas para from_user
    SELECT * INTO v_result FROM credit_wallet(
        v_proposal.from_user_id,
        20,
        'bonus'::coin_transaction_type,
        'Bonus por match aceito #' || v_proposal.id,
        NULL, NULL, NULL,
        'match', v_proposal.id::TEXT,
        jsonb_build_object('role', 'from_user', 'counterpart', v_proposal.to_user_id)
    );
    v_total_credited := v_total_credited + 20;

    -- 20 moedas para to_user
    SELECT * INTO v_result FROM credit_wallet(
        v_proposal.to_user_id,
        20,
        'bonus'::coin_transaction_type,
        'Bonus por match aceito #' || v_proposal.id,
        NULL, NULL, NULL,
        'match', v_proposal.id::TEXT,
        jsonb_build_object('role', 'to_user', 'counterpart', v_proposal.from_user_id)
    );
    v_total_credited := v_total_credited + 20;

    -- Bonus para embaixador (referred_by) do from_user OU to_user
    SELECT referred_by INTO v_from_inviter FROM profiles WHERE id = v_proposal.from_user_id;
    SELECT referred_by INTO v_to_inviter FROM profiles WHERE id = v_proposal.to_user_id;

    -- Prioridade: embaixador do consumidor (to_user se for consumidor)
    v_inviter_id := COALESCE(v_to_inviter, v_from_inviter);

    IF v_inviter_id IS NOT NULL THEN
        INSERT INTO coin_wallet (user_id, balance) VALUES (v_inviter_id, 0) ON CONFLICT DO NOTHING;
        SELECT * INTO v_result FROM credit_wallet(
            v_inviter_id,
            20,
            'bonus'::coin_transaction_type,
            'Bonus por match na rede #' || v_proposal.id,
            NULL, NULL, NULL,
            'match', v_proposal.id::TEXT,
            jsonb_build_object('role', 'inviter', 'matched_users', jsonb_build_array(v_proposal.from_user_id, v_proposal.to_user_id))
        );
        v_inviter_credited := 20;
    END IF;

    -- Marca como processado
    UPDATE match_proposals
    SET commissions_processed_at = NOW()
    WHERE id = p_proposal_id;

    RETURN QUERY SELECT TRUE, 'Comissoes processadas'::TEXT, v_total_credited, v_inviter_credited;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. RPC: PROCESS_PAYMENT_COMMISSIONS
-- =====================================================
-- Chamada quando um pagamento da plataforma e confirmado (Stripe
-- webhook -> checkout.session.completed OU invoice.payment_succeeded).
-- Calcula 5% para embaixador (referred_by) + 15% para dono da UFV.
-- Insere 2 rows em comissoes. Marca pagamentos.commissions_processed_at
-- e ufv_fee_paid + embaixador_fee_paid. Idempotente.
-- =====================================================

CREATE OR REPLACE FUNCTION process_payment_commissions(
    p_payment_id BIGINT
) RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    embaixador_commission DECIMAL,
    ufv_commission DECIMAL
) AS $$
DECLARE
    v_pag pagamentos%ROWTYPE;
    v_cliente_profile profiles%ROWTYPE;
    v_inviter_id UUID;
    v_embaixador_comissao DECIMAL(10,2) := 0;
    v_ufv_comissao DECIMAL(10,2) := 0;
    v_gerador_id UUID;
BEGIN
    -- Lock do pagamento
    SELECT * INTO v_pag
    FROM pagamentos
    WHERE id = p_payment_id
    FOR UPDATE;

    IF v_pag.id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Pagamento nao encontrado'::TEXT, 0, 0;
        RETURN;
    END IF;

    IF v_pag.status <> 'succeeded' THEN
        RETURN QUERY SELECT FALSE, 'Pagamento nao foi confirmado'::TEXT, 0, 0;
        RETURN;
    END IF;

    -- Idempotencia
    IF v_pag.commissions_processed_at IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, 'Comissoes ja processadas'::TEXT,
            COALESCE((SELECT valor_comissao FROM comissoes WHERE cliente_id = v_pag.user_id AND tipo_comissao = 'embaixador_5pct' AND created_at = v_pag.commissions_processed_at LIMIT 1), 0),
            COALESCE((SELECT valor_comissao FROM comissoes WHERE cliente_id = v_pag.user_id AND tipo_comissao = 'ufv_15pct' AND created_at = v_pag.commissions_processed_at LIMIT 1), 0);
        RETURN;
    END IF;

    -- Perfil do cliente
    SELECT * INTO v_cliente_profile FROM profiles WHERE id = v_pag.user_id;
    IF v_cliente_profile.id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Perfil do cliente nao encontrado'::TEXT, 0, 0;
        RETURN;
    END IF;

    -- Comissao embaixador: 5% do valor, apenas se cliente tem referred_by
    IF v_cliente_profile.referred_by IS NOT NULL THEN
        v_embaixador_comissao := ROUND((v_pag.valor * 5) / 100, 2);

        INSERT INTO comissoes (
            embaixador_id, cliente_id, valor_comissao, percentual,
            tipo_comissao, status_pagamento, stripe_payment_intent,
            data_pagamento, mes_referencia, ano_referencia
        ) VALUES (
            v_cliente_profile.referred_by, v_pag.user_id, v_embaixador_comissao, 5,
            'embaixador_5pct', 'pago', v_pag.stripe_payment_intent,
            NOW(), date_trunc('month', NOW())::date, EXTRACT(year FROM NOW())::integer
        );
    END IF;

    -- Comissao UFV: 15% do valor, apenas para clientes consumidores
    -- com match ativo (gerador_id vem de metadata ou contexto)
    -- Por enquanto, se cliente.tipo = 'consumidor' e existe match aceito,
    -- paga 15% ao gerador (dono da UFV).
    IF v_cliente_profile.tipo = 'consumidor' THEN
        -- Pega o gerador do match mais recente aceito do consumidor
        SELECT to_user_id INTO v_gerador_id
        FROM match_proposals
        WHERE from_user_id = v_pag.user_id AND status = 'accepted'
        ORDER BY responded_at DESC
        LIMIT 1;

        IF v_gerador_id IS NOT NULL THEN
            v_ufv_comissao := ROUND((v_pag.valor * 15) / 100, 2);

            INSERT INTO comissoes (
                embaixador_id, cliente_id, valor_comissao, percentual,
                tipo_comissao, status_pagamento, stripe_payment_intent,
                data_pagamento, mes_referencia, ano_referencia
            ) VALUES (
                v_gerador_id, v_pag.user_id, v_ufv_comissao, 15,
                'ufv_15pct', 'pago', v_pag.stripe_payment_intent,
                NOW(), date_trunc('month', NOW())::date, EXTRACT(year FROM NOW())::integer
            );
        END IF;
    END IF;

    -- Marca como processado
    UPDATE pagamentos
    SET commissions_processed_at = NOW(),
        ufv_fee_paid = (v_ufv_comissao > 0),
        embaixador_fee_paid = (v_embaixador_comissao > 0)
    WHERE id = p_payment_id;

    RETURN QUERY SELECT TRUE, 'Comissoes processadas'::TEXT, v_embaixador_comissao, v_ufv_comissao;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. SEED: ULTIMO ACORDO PARA USUARIOS EXISTENTES
-- =====================================================
-- (Apenas para profiles que ja aceitaram manualmente via suporte.
--  A migration nao cria acordo retroativo; usuarios existentes
--  terao que aceitar o modal no proximo login.)
-- =====================================================

-- =====================================================
-- 10. COMENTARIOS
-- =====================================================

COMMENT ON TABLE payment_agreements IS 'Log de aceite do acordo de pagamento. Idempotente por (user, terms_version).';
COMMENT ON COLUMN profiles.agreed_to_payment_terms_at IS 'Data do ultimo aceite do acordo de pagamento.';
COMMENT ON COLUMN profiles.last_terms_version IS 'Versao do acordo aceito (ex: v1.0, v1.1).';
COMMENT ON COLUMN match_proposals.commissions_processed_at IS 'Quando as comissoes de 20+20+20 moedas foram creditadas. NULL = pendente.';
COMMENT ON COLUMN pagamentos.commissions_processed_at IS 'Quando comissoes 5% embaixador + 15% UFV foram processadas.';
COMMENT ON COLUMN pagamentos.ufv_fee_paid IS 'TRUE se a taxa UFV de 15% foi creditada ao gerador.';
COMMENT ON COLUMN pagamentos.embaixador_fee_paid IS 'TRUE se a comissao de 5% foi creditada ao embaixador.';
COMMENT ON FUNCTION record_payment_agreement IS 'Registra aceite do acordo de pagamento. Idempotente por (user_id, terms_version).';
COMMENT ON FUNCTION process_match_commissions IS 'Credita 20+20 moedas ao match aceito + 20 ao embaixador. Idempotente.';
COMMENT ON FUNCTION process_payment_commissions IS 'Calcula 5% embaixador + 15% UFV em um pagamento. Idempotente.';
