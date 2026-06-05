-- ============================================
-- MIGRATION 20260107: COIN SYSTEM (MOEDAS ENERGIALIVRE)
-- EnergiaLivre v2.2
-- ============================================
-- Sistema de moeda interna para Geradores consumirem ações
-- da plataforma (publicar ofertas, destaque, desbloquear
-- consumidores, propostas privadas, IA, etc).
--
-- Modelo econômico:
--   1 moeda = R$ 0,70
--   Base  : tarifa média residencial ANEEL ≈ R$ 0,78/kWh
--   Desconto: 10% (a plataforma DEVE ser mais barata que a rede)
--   Intenção: o gerador sai ganhando ao usar a plataforma
--             em vez de vender excedente direto na rede.
--
-- Esta migration é idempotente.
-- Dependência: tabela `admins` deve existir (criada em 20260104).
-- ============================================

-- ============================================
-- 1. ENUM: TIPO DE TRANSAÇÃO
-- ============================================
DO $$ BEGIN
    CREATE TYPE coin_transaction_type AS ENUM (
        'purchase',      -- Compra de pacote (entrada)
        'consume',       -- Consumo de moeda (saída)
        'refund',        -- Reembolso (entrada)
        'bonus',         -- Bônus (entrada)
        'admin_adjust'   -- Ajuste manual do admin (entrada ou saída)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. TABELA: COIN_PACKAGES (CATÁLOGO)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_packages (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    coins INTEGER NOT NULL CHECK (coins > 0),
    price_cents INTEGER NOT NULL CHECK (price_cents > 0),
    currency TEXT NOT NULL DEFAULT 'brl',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_packages_active_sort
    ON coin_packages(is_active, sort_order);

DROP TRIGGER IF EXISTS update_coin_packages_updated_at ON coin_packages;
CREATE TRIGGER update_coin_packages_updated_at
    BEFORE UPDATE ON coin_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active packages" ON coin_packages;
CREATE POLICY "Anyone can view active packages" ON coin_packages
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage packages" ON coin_packages;
CREATE POLICY "Admin can manage packages" ON coin_packages
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    );

-- ============================================
-- 3. TABELA: COIN_WALLET (1 POR USUÁRIO)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_wallet (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    lifetime_bought INTEGER NOT NULL DEFAULT 0,
    lifetime_spent INTEGER NOT NULL DEFAULT 0,
    lifetime_refunded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_coin_wallet_updated_at ON coin_wallet;
CREATE TRIGGER update_coin_wallet_updated_at
    BEFORE UPDATE ON coin_wallet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE coin_wallet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallet" ON coin_wallet;
CREATE POLICY "Users can view own wallet" ON coin_wallet
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all wallets" ON coin_wallet;
CREATE POLICY "Admin can view all wallets" ON coin_wallet
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    );

-- INSERT/UPDATE no wallet é exclusivo via RPC credit_wallet/debit_wallet (SECURITY DEFINER).

-- ============================================
-- 4. TABELA: COIN_TRANSACTIONS (LEDGER APPEND-ONLY)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type coin_transaction_type NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    reason TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id TEXT,
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    coin_package_id INTEGER REFERENCES coin_packages(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT nonzero_amount CHECK (amount <> 0)
);

CREATE INDEX IF NOT EXISTS idx_coin_tx_user_created
    ON coin_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_tx_type ON coin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_tx_session
    ON coin_transactions(stripe_session_id)
    WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coin_tx_payment_intent
    ON coin_transactions(stripe_payment_intent_id)
    WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON coin_transactions;
CREATE POLICY "Users can view own transactions" ON coin_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all transactions" ON coin_transactions;
CREATE POLICY "Admin can view all transactions" ON coin_transactions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    );

-- INSERT é exclusivo via RPC.

-- ============================================
-- 5. TABELA: COIN_SUBSCRIPTIONS (FUTURO - RECORRÊNCIA)
-- ============================================
-- Estrutura já criada para suportar Fase futura (assinatura mensal
-- que credita X moedas todo mês). Não usada no app ainda.
-- ============================================
CREATE TABLE IF NOT EXISTS coin_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_package_id INTEGER REFERENCES coin_packages(id),
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_sub_user ON coin_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_sub_status
    ON coin_subscriptions(status)
    WHERE status = 'active';

DROP TRIGGER IF EXISTS update_coin_subscriptions_updated_at ON coin_subscriptions;
CREATE TRIGGER update_coin_subscriptions_updated_at
    BEFORE UPDATE ON coin_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE coin_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON coin_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON coin_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all subscriptions" ON coin_subscriptions;
CREATE POLICY "Admin can view all subscriptions" ON coin_subscriptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    );

-- ============================================
-- 6. RPC: CREDIT_WALLET (ATÔMICO + IDEMPOTENTE)
-- ============================================
-- Credita N moedas no wallet, criando ledger entry.
-- Idempotente: se stripe_session_id já foi processado, retorna
-- o resultado anterior sem creditar de novo.
-- SECURITY DEFINER bypassa RLS para escrita.
-- ============================================

CREATE OR REPLACE FUNCTION credit_wallet(
    p_user_id UUID,
    p_amount INTEGER,
    p_type coin_transaction_type,
    p_reason TEXT,
    p_coin_package_id INTEGER DEFAULT NULL,
    p_stripe_session_id TEXT DEFAULT NULL,
    p_stripe_payment_intent_id TEXT DEFAULT NULL,
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS TABLE(new_balance INTEGER, transaction_id BIGINT) AS $$
DECLARE
    v_new_balance INTEGER;
    v_tx_id BIGINT;
    v_existing_balance INTEGER;
    v_existing_tx_id BIGINT;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'amount must be positive, got %', p_amount
            USING ERRCODE = 'check_violation';
    END IF;

    -- Idempotência: se stripe_session_id já foi creditado, retorna o anterior
    IF p_stripe_session_id IS NOT NULL THEN
        SELECT ct.balance_after, ct.id
        INTO v_existing_balance, v_existing_tx_id
        FROM coin_transactions ct
        WHERE ct.stripe_session_id = p_stripe_session_id
        LIMIT 1;

        IF v_existing_tx_id IS NOT NULL THEN
            RETURN QUERY SELECT v_existing_balance, v_existing_tx_id;
            RETURN;
        END IF;
    END IF;

    -- Cria wallet se não existir
    INSERT INTO coin_wallet (user_id, balance)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Atualiza saldo e contadores
    UPDATE coin_wallet
    SET balance = balance + p_amount,
        lifetime_bought = lifetime_bought + CASE
            WHEN p_type = 'purchase' THEN p_amount ELSE 0 END,
        lifetime_refunded = lifetime_refunded + CASE
            WHEN p_type = 'refund' THEN p_amount ELSE 0 END,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_new_balance;

    IF v_new_balance IS NULL THEN
        RAISE EXCEPTION 'wallet update failed for user %', p_user_id;
    END IF;

    -- Insere ledger entry
    INSERT INTO coin_transactions (
        user_id, type, amount, balance_after, reason,
        coin_package_id, stripe_session_id, stripe_payment_intent_id,
        related_entity_type, related_entity_id, metadata
    )
    VALUES (
        p_user_id, p_type, p_amount, v_new_balance, p_reason,
        p_coin_package_id, p_stripe_session_id, p_stripe_payment_intent_id,
        p_related_entity_type, p_related_entity_id, p_metadata
    )
    RETURNING id INTO v_tx_id;

    RETURN QUERY SELECT v_new_balance, v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. RPC: DEBIT_WALLET (FUTURO - FASE 2)
-- ============================================
-- Debita N moedas, validando saldo. Criada já para a Fase 2
-- (consumo de ações: publicar oferta, destaque, etc).
-- ============================================

CREATE OR REPLACE FUNCTION debit_wallet(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT,
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS TABLE(new_balance INTEGER, transaction_id BIGINT) AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_tx_id BIGINT;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'amount must be positive, got %', p_amount
            USING ERRCODE = 'check_violation';
    END IF;

    -- Lock da linha do wallet
    SELECT balance INTO v_current_balance
    FROM coin_wallet
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'wallet not found for user %', p_user_id
            USING ERRCODE = 'P0002';
    END IF;

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'insufficient balance: have %, need %', v_current_balance, p_amount
            USING ERRCODE = 'P0001';
    END IF;

    v_new_balance := v_current_balance - p_amount;

    UPDATE coin_wallet
    SET balance = v_new_balance,
        lifetime_spent = lifetime_spent + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    INSERT INTO coin_transactions (
        user_id, type, amount, balance_after, reason,
        related_entity_type, related_entity_id, metadata
    )
    VALUES (
        p_user_id, 'consume', -p_amount, v_new_balance, p_reason,
        p_related_entity_type, p_related_entity_id, p_metadata
    )
    RETURNING id INTO v_tx_id;

    RETURN QUERY SELECT v_new_balance, v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. SEED: PACOTES INICIAIS
-- ============================================
INSERT INTO coin_packages (code, name, description, coins, price_cents, sort_order)
VALUES
    ('starter',     'Starter',     '300 moedas para começar a publicar ofertas',         300,   21000, 1),
    ('growth',      'Growth',      '1.000 moedas para uso frequente',                   1000,   70000, 2),
    ('professional','Professional','3.000 moedas para geradores ativos',                3000,  210000, 3),
    ('enterprise',  'Enterprise',  '10.000 moedas para operações em escala',           10000,  700000, 4)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    coins = EXCLUDED.coins,
    price_cents = EXCLUDED.price_cents,
    sort_order = EXCLUDED.sort_order,
    is_active = true,
    updated_at = NOW();

-- ============================================
-- 9. COMENTÁRIOS
-- ============================================
COMMENT ON TABLE coin_packages IS 'Catálogo de pacotes de moedas compráveis. Editável pelo admin.';
COMMENT ON TABLE coin_wallet IS 'Saldo atual de moedas por usuário. 1:1 com auth.users. Escrita exclusiva via RPC.';
COMMENT ON TABLE coin_transactions IS 'Ledger append-only de todas as movimentações de moeda.';
COMMENT ON TABLE coin_subscriptions IS 'Assinaturas recorrentes de pacotes (estrutura para fase futura).';
COMMENT ON FUNCTION credit_wallet IS 'Credita N moedas atomicamente. Idempotente via stripe_session_id. SECURITY DEFINER.';
COMMENT ON FUNCTION debit_wallet IS 'Debita N moedas atomicamente. Valida saldo, raise se insuficiente. SECURITY DEFINER.';
