-- =============================================================
-- 20260613_platform_8percent_fee.sql
-- Taxa da plataforma: 8% sobre todas as faturas
-- Adiciona tipo 'plataforma_8pct' em comissoes
-- Atualiza RPC process_payment_commissions
-- =============================================================

-- 1. Adiciona tipo plataforma_8pct no CHECK constraint de comissoes
ALTER TABLE public.comissoes DROP CONSTRAINT IF EXISTS comissoes_tipo_comissao_check;
ALTER TABLE public.comissoes ADD CONSTRAINT comissoes_tipo_comissao_check
  CHECK (tipo_comissao IN ('cadastro', 'recorrente', 'match', 'embaixador_5pct', 'ufv_15pct', 'plataforma_8pct'));

-- 2. Atualiza RPC process_payment_commissions para incluir taxa de 8%
DROP FUNCTION IF EXISTS public.process_payment_commissions(BIGINT);
CREATE OR REPLACE FUNCTION public.process_payment_commissions(
  p_payment_id BIGINT
)
RETURNS TABLE(success BOOLEAN, message TEXT, embaixador_commission DECIMAL, ufv_commission DECIMAL, plataforma_fee DECIMAL)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pag RECORD;
  v_cliente_profile RECORD;
  v_match RECORD;
  v_embaixador_id UUID;
  v_embaixador_comissao DECIMAL(10,2) := 0;
  v_ufv_comissao DECIMAL(10,2) := 0;
  v_plataforma_fee DECIMAL(10,2) := 0;
BEGIN
  -- Busca o pagamento
  SELECT * INTO v_pag FROM pagamentos WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Pagamento nao encontrado'::TEXT, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL;
    RETURN;
  END IF;

  -- Se ja processou, retorna
  IF v_pag.commissions_processed_at IS NOT NULL THEN
    RETURN QUERY SELECT TRUE, 'Ja processado (idempotente)'::TEXT,
      COALESCE((SELECT valor_comissao FROM comissoes WHERE cliente_id = v_pag.user_id AND tipo_comissao = 'embaixador_5pct' AND created_at = v_pag.commissions_processed_at LIMIT 1), 0),
      COALESCE((SELECT valor_comissao FROM comissoes WHERE cliente_id = v_pag.user_id AND tipo_comissao = 'ufv_15pct' AND created_at = v_pag.commissions_processed_at LIMIT 1), 0),
      COALESCE((SELECT valor_comissao FROM comissoes WHERE cliente_id = v_pag.user_id AND tipo_comissao = 'plataforma_8pct' AND created_at = v_pag.commissions_processed_at LIMIT 1), 0);
    RETURN;
  END IF;

  -- Taxa da plataforma: 8% do valor do pagamento
  v_plataforma_fee := ROUND((v_pag.valor * 8) / 100, 2);
  IF v_plataforma_fee > 0 THEN
    INSERT INTO comissoes (embaixador_id, cliente_id, valor_comissao, percentual, tipo_comissao, status_pagamento, stripe_payment_intent, data_pagamento, mes_referencia, ano_referencia)
    VALUES (v_pag.user_id, v_pag.user_id, v_plataforma_fee, 8, 'plataforma_8pct', 'pago', v_pag.stripe_payment_intent, NOW(), date_trunc('month', NOW())::date, EXTRACT(year FROM NOW())::integer);
  END IF;

  -- Comissao embaixador: 5% se cliente tem referred_by
  SELECT * INTO v_cliente_profile FROM profiles WHERE id = v_pag.user_id;
  IF v_cliente_profile.referred_by IS NOT NULL THEN
    v_embaixador_comissao := ROUND((v_pag.valor * 5) / 100, 2);
    INSERT INTO comissoes (embaixador_id, cliente_id, valor_comissao, percentual, tipo_comissao, status_pagamento, stripe_payment_intent, data_pagamento, mes_referencia, ano_referencia)
    VALUES (v_cliente_profile.referred_by, v_pag.user_id, v_embaixador_comissao, 5, 'embaixador_5pct', 'pago', v_pag.stripe_payment_intent, NOW(), date_trunc('month', NOW())::date, EXTRACT(year FROM NOW())::integer);
  END IF;

  -- Comissao UFV: 15% se consumidor tem match ativo
  IF v_pag.user_id IS NOT NULL THEN
    SELECT * INTO v_match FROM match_proposals
    WHERE consumidor_id = v_pag.user_id
      AND status = 'accepted'
    ORDER BY updated_at DESC
    LIMIT 1;

    IF FOUND AND v_match.gerador_id IS NOT NULL THEN
      v_ufv_comissao := ROUND((v_pag.valor * 15) / 100, 2);
      INSERT INTO comissoes (embaixador_id, cliente_id, valor_comissao, percentual, tipo_comissao, status_pagamento, stripe_payment_intent, data_pagamento, mes_referencia, ano_referencia)
      VALUES (v_match.gerador_id, v_pag.user_id, v_ufv_comissao, 15, 'ufv_15pct', 'pago', v_pag.stripe_payment_intent, NOW(), date_trunc('month', NOW())::date, EXTRACT(year FROM NOW())::integer);
    END IF;
  END IF;

  -- Marca processado
  UPDATE pagamentos
  SET commissions_processed_at = NOW(),
      embaixador_fee_paid = (v_embaixador_comissao > 0),
      ufv_fee_paid = (v_ufv_comissao > 0)
  WHERE id = p_payment_id;

  RETURN QUERY SELECT TRUE, 'Comissoes processadas'::TEXT, v_embaixador_comissao, v_ufv_comissao, v_plataforma_fee;
END;
$$;

COMMENT ON FUNCTION process_payment_commissions IS 'Calcula 5% embaixador + 15% UFV + 8% plataforma em um pagamento. Idempotente.';
