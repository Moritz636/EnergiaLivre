-- =============================================================
-- 20260612_generator_referral_5percent.sql
-- Gerador ganha 5% do amigo gerador + rede do amigo
-- Comissao para geradores que indicam outros geradores
-- =============================================================

-- =============================================================
-- 1. Add referral tracking columns to profiles
-- =============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referral_earnings DECIMAL(12,2) DEFAULT 0;

-- =============================================================
-- 2. Generator referral commissions table
-- =============================================================
CREATE TABLE IF NOT EXISTS gerador_referrals (
  id BIGSERIAL PRIMARY KEY,
  gerador_origem_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gerador_indicado_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  percentual DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  receita_gerada DECIMAL(12,2) DEFAULT 0,
  comissao_devida DECIMAL(12,2) DEFAULT 0,
  comissao_paga DECIMAL(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  UNIQUE(gerador_indicado_id)
);

CREATE INDEX IF NOT EXISTS idx_gerador_referrals_origem ON gerador_referrals(gerador_origem_id);
CREATE INDEX IF NOT EXISTS idx_gerador_referrals_indicado ON gerador_referrals(gerador_indicado_id);
COMMENT ON TABLE gerador_referrals IS 'Vinculo de indicacao entre geradores: origem indica indicado e recebe percentual sobre receita.';

-- =============================================================
-- 3. Commission payments tracking
-- =============================================================
CREATE TABLE IF NOT EXISTS gerador_referral_payments (
  id BIGSERIAL PRIMARY KEY,
  referral_id BIGINT NOT NULL REFERENCES gerador_referrals(id) ON DELETE CASCADE,
  gerador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  receita_periodo DECIMAL(12,2) NOT NULL DEFAULT 0,
  percentual_aplicado DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  valor_comissao DECIMAL(12,2) NOT NULL DEFAULT 0,
  status_pagamento TEXT NOT NULL DEFAULT 'pendente',
  pago_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gerador_referral_payments_gerador ON gerador_referral_payments(gerador_id);
CREATE INDEX IF NOT EXISTS idx_gerador_referral_payments_periodo ON gerador_referral_payments(mes_referencia, ano_referencia);
COMMENT ON TABLE gerador_referral_payments IS 'Historico de comissoes pagas ou pendentes para geradores por indicacao.';

-- =============================================================
-- 4. Function: calculate generator referral commission
-- =============================================================
CREATE OR REPLACE FUNCTION calcular_comissao_gerador_referral(
  p_referral_id BIGINT,
  p_mes INTEGER,
  p_ano INTEGER
)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_receita_total DECIMAL(12,2);
  v_referral RECORD;
  v_comissao DECIMAL(12,2);
BEGIN
  SELECT * INTO v_referral FROM gerador_referrals WHERE id = p_referral_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(lucro_total), 0) INTO v_receita_total
  FROM geradores
  WHERE id = v_referral.gerador_indicado_id
    AND EXTRACT(MONTH FROM COALESCE(updated_at, created_at)) = p_mes
    AND EXTRACT(YEAR FROM COALESCE(updated_at, created_at)) = p_ano;

  v_comissao := (v_receita_total * v_referral.percentual) / 100;

  INSERT INTO gerador_referral_payments (
    referral_id, gerador_id, mes_referencia, ano_referencia,
    receita_periodo, percentual_aplicado, valor_comissao, status_pagamento
  ) VALUES (
    p_referral_id, v_referral.gerador_origem_id, p_mes, p_ano,
    v_receita_total, v_referral.percentual, v_comissao, 'pendente'
  );

  UPDATE profiles
  SET total_referral_earnings = COALESCE(total_referral_earnings, 0) + v_comissao
  WHERE id = v_referral.gerador_origem_id;

  RETURN v_comissao;
END;
$$;

GRANT EXECUTE ON FUNCTION calcular_comissao_gerador_referral(BIGINT, INTEGER, INTEGER) TO authenticated;

-- =============================================================
-- 5. RLS — enable row level security
-- =============================================================
ALTER TABLE gerador_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gerador_referral_payments ENABLE ROW LEVEL SECURITY;

-- Policies: generator sees own referrals
DROP POLICY IF EXISTS gerador_referrals_select_own ON gerador_referrals;
CREATE POLICY gerador_referrals_select_own ON gerador_referrals
  FOR SELECT USING (gerador_origem_id = auth.uid() OR gerador_indicado_id = auth.uid());

DROP POLICY IF EXISTS gerador_referral_payments_select_own ON gerador_referral_payments;
CREATE POLICY gerador_referral_payments_select_own ON gerador_referral_payments
  FOR SELECT USING (gerador_id = auth.uid());

-- Policies: admin full access
DROP POLICY IF EXISTS admin_all_gerador_referrals ON gerador_referrals;
CREATE POLICY admin_all_gerador_referrals ON gerador_referrals
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS admin_all_gerador_referral_payments ON gerador_referral_payments;
CREATE POLICY admin_all_gerador_referral_payments ON gerador_referral_payments
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================
-- FIM
-- =============================================================
