-- ============================================
-- MIGRATION: 20260614 - Ofertas de Excedente
-- 
-- Tabela para gerentes (geradores) oferecerem
-- sua geração sobressalente para consumidores.
-- ============================================

CREATE TABLE IF NOT EXISTS ofertas_excedente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gerador_id UUID NOT NULL REFERENCES geradores(id) ON DELETE CASCADE,
  kwh_disponivel FLOAT NOT NULL CHECK (kwh_disponivel > 0),
  preco_kwh DECIMAL(10,4) NOT NULL CHECK (preco_kwh > 0),
  preco_total DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa'
    CHECK (status IN ('ativa', 'contratada', 'expirada', 'cancelada')),
  invoice_id UUID REFERENCES invoice_uploads(id) ON DELETE SET NULL,
  periodo_ref TEXT NOT NULL, -- '2026-06'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  contratada_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contratada_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ofertas_status ON ofertas_excedente(status);
CREATE INDEX IF NOT EXISTS idx_ofertas_gerador ON ofertas_excedente(gerador_id);

-- RLS
ALTER TABLE ofertas_excedente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ofertas ativas visíveis para todos"
  ON ofertas_excedente FOR SELECT
  USING (status = 'ativa');

CREATE POLICY "Gerador vê suas próprias ofertas"
  ON ofertas_excedente FOR SELECT
  USING (gerador_id IN (SELECT id FROM geradores WHERE id = auth.uid()));

CREATE POLICY "Admin vê tudo"
  ON ofertas_excedente FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Gerador cria ofertas"
  ON ofertas_excedente FOR INSERT
  WITH CHECK (gerador_id IN (SELECT id FROM geradores WHERE id = auth.uid()));

CREATE POLICY "Gerador atualiza próprias ofertas"
  ON ofertas_excedente FOR UPDATE
  USING (gerador_id IN (SELECT id FROM geradores WHERE id = auth.uid()));

-- Função para contratar oferta (consumidor aceita)
CREATE OR REPLACE FUNCTION contratar_oferta(
  p_oferta_id UUID,
  p_consumidor_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_oferta ofertas_excedente%ROWTYPE;
BEGIN
  SELECT * INTO v_oferta FROM ofertas_excedente WHERE id = p_oferta_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Oferta não encontrada');
  END IF;
  IF v_oferta.status != 'ativa' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Oferta não está mais disponível');
  END IF;

  UPDATE ofertas_excedente
  SET status = 'contratada',
      contratada_por = p_consumidor_id,
      contratada_at = NOW()
  WHERE id = p_oferta_id;

  -- Cria proposta de match automaticamente
  INSERT INTO match_proposals (from_user_id, to_user_id, kwh_proposto, valor_proposto, status, message)
  VALUES (
    p_consumidor_id,
    (SELECT gerador_id FROM ofertas_excedente WHERE id = p_oferta_id),
    v_oferta.kwh_disponivel,
    v_oferta.preco_total,
    'pending',
    'Contratação automática via oferta de excedente'
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Função para calcular e criar oferta de excedente automaticamente
CREATE OR REPLACE FUNCTION calcular_excedente_e_ofertar(
  p_gerador_id UUID,
  p_consumo_kwh FLOAT,
  p_invoice_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gerador geradores%ROWTYPE;
  v_geracao_mensal FLOAT;
  v_excedente FLOAT;
  v_preco_kwh DECIMAL(10,4);
  v_preco_total DECIMAL(12,2);
  v_periodo TEXT;
  v_oferta_id UUID;
BEGIN
  -- Busca dados do gerador
  SELECT * INTO v_gerador FROM geradores WHERE id = p_gerador_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gerador não encontrado');
  END IF;

  -- Cálculo da geração mensal estimada (kWp * 120 kWh/kWp = média Brasil)
  v_geracao_mensal := v_gerador.capacidade_kwp * 120;

  -- Excedente = geração - consumo
  v_excedente := GREATEST(v_geracao_mensal - p_consumo_kwh, 0);

  IF v_excedente <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem excedente disponível', 'geracao', v_geracao_mensal, 'consumo', p_consumo_kwh);
  END IF;

  -- Preço: 80% da tarifa média nacional (R$ 0,95/kWh), competitivo
  -- Mas não abaixo do mínimo viavel
  v_preco_kwh := GREATEST(0.75 * 0.95, v_gerador.preco_kwh);
  v_preco_total := ROUND((v_excedente * v_preco_kwh)::numeric, 2);
  v_periodo := TO_CHAR(NOW(), 'YYYY-MM');

  -- Atualiza excedente mensal do gerador
  UPDATE geradores SET excedente_mensal_kwh = v_excedente WHERE id = p_gerador_id;

  -- Cria oferta
  INSERT INTO ofertas_excedente (gerador_id, kwh_disponivel, preco_kwh, preco_total, periodo_ref, invoice_id)
  VALUES (p_gerador_id, v_excedente, v_preco_kwh, v_preco_total, v_periodo, p_invoice_id)
  RETURNING id INTO v_oferta_id;

  RETURN jsonb_build_object(
    'success', true,
    'oferta_id', v_oferta_id,
    'kwh_disponivel', v_excedente,
    'preco_kwh', v_preco_kwh,
    'preco_total', v_preco_total,
    'geracao_estimada', v_geracao_mensal,
    'consumo', p_consumo_kwh
  );
END;
$$;
