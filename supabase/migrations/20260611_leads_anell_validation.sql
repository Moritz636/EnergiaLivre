-- =====================================================
-- ENERGIALIVRE — Migration 20260611 (Leads ANELL Validation)
-- Cole no Supabase SQL Editor → New query → Run
-- =====================================================
-- Idempotente: pode ser reexecutado sem dano.
-- Adiciona:
--   * Colunas de validacao ANELL na tabela leads
--   * Tabela anell_validation_log
--   * partner_code na tabela profiles
--   * Funcoes generate_partner_code, validate_usina_anell
--   * RLS + policies para anell_validation_log
--   * Trigger para partner_code automatico
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Leads — colunas de validacao ANELL
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS codigo_parceiro TEXT,
    ADD COLUMN IF NOT EXISTS anell_validated BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS anell_validated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS anell_data JSONB,
    ADD COLUMN IF NOT EXISTS match_ready BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS distribuidora TEXT,
    ADD COLUMN IF NOT EXISTS consumo_medio_kwh DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS geracao_media_kwh DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS bandeira_tarifaria TEXT;

-- 2) Tabela de log de validacao ANELL
CREATE TABLE IF NOT EXISTS public.anell_validation_log (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES public.leads(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo_consulta TEXT NOT NULL DEFAULT 'anell_api',
  request_data JSONB,
  response_data JSONB,
  status TEXT NOT NULL DEFAULT 'pendente',
  resultado TEXT,
  score_validade DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 3) Profiles — partner_code
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS partner_code TEXT;

-- 4) Funcao para gerar codigo de parceiro
CREATE OR REPLACE FUNCTION public.generate_partner_code(p_nome TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_count INTEGER;
BEGIN
  v_code := UPPER(LEFT(p_nome, 2)) || 'PRC' || EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COUNT(*) INTO v_count FROM public.profiles WHERE partner_code = v_code;
  IF v_count > 0 THEN
    v_code := v_code || '-' || (v_count + 1)::TEXT;
  END IF;
  RETURN v_code;
END;
$$;

-- 5) Funcao para validar usina via ANELL (mock/scaffold)
CREATE OR REPLACE FUNCTION public.validate_usina_anell(
  p_lead_id BIGINT,
  p_distribuidora TEXT,
  p_consumo_kwh DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSONB;
  v_score DECIMAL(5,2);
  v_status TEXT;
BEGIN
  -- Mock ANELL validation algorithm
  -- In production, this would call ANELL's API
  v_score := 75.0 + random() * 25.0;

  IF v_score >= 70.0 THEN
    v_status := 'aprovado';
  ELSIF v_score >= 40.0 THEN
    v_status := 'pendente_documentacao';
  ELSE
    v_status := 'reprovado';
  END IF;

  v_resultado := jsonb_build_object(
    'score', v_score,
    'status', v_status,
    'distribuidora', p_distribuidora,
    'consumo_confirmado', p_consumo_kwh,
    'validade_leilao', NOW() + INTERVAL '90 days',
    'anell_protocolo', 'ANL-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0'),
    'regiao', CASE
      WHEN p_distribuidora IN ('CEMIG', 'CPFL', 'LIGHT', 'EDP', 'ENEL SP', 'ENEL RJ', 'ENEL CE', 'COELBA', 'CELPE', 'CELG') THEN 'SE'
      WHEN p_distribuidora IN ('CEEE', 'RGE', 'COPEL', 'CELESC', 'EFLUL') THEN 'S'
      WHEN p_distribuidora IN ('AMPLA', 'ENERGISA', 'ESE') THEN 'NE'
      ELSE 'ND'
    END,
    'validade_juridica', TRUE,
    'lei_aplicavel', 'Lei 14.300/2022, REN 687/2015, REN 1000/2021'
  );

  INSERT INTO public.anell_validation_log (lead_id, tipo_consulta, response_data, status, resultado, score_validade)
  VALUES (p_lead_id, 'anell_mock_api', v_resultado, v_status, v_status::TEXT, v_score);

  RETURN v_resultado;
END;
$$;

-- 6) RLS e policies para anell_validation_log
ALTER TABLE public.anell_validation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own validation logs" ON public.anell_validation_log;
CREATE POLICY "Users can view own validation logs" ON public.anell_validation_log
  FOR SELECT USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all" ON public.anell_validation_log;
CREATE POLICY "Admins can view all" ON public.anell_validation_log
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7) Trigger para auto-gerar partner_code em profiles
CREATE OR REPLACE FUNCTION public.set_partner_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tipo = 'parceiro' AND NEW.partner_code IS NULL THEN
    NEW.partner_code := public.generate_partner_code(COALESCE(NEW.nome, 'PR'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_partner_code ON public.profiles;
CREATE TRIGGER trg_set_partner_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_partner_code();
