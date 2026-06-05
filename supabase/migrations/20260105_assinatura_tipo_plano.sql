-- ============================================
-- MIGRATION 20260105: COLUNAS MULTI-PLANO EM ASSINATURAS
-- EnergiaLivre v2.1
-- ============================================
-- Adiciona suporte a planos de GERADOR e MEMBER_PLUS na tabela
-- assinaturas (antes só havia dados de CONSUMIDOR).
--
-- Contexto:
--   O webhook do Stripe (app/api/stripe/webhook/route.ts) insere
--   tipo_plano e capacidade_kwp no insert inicial da assinatura,
--   mas essas colunas nunca foram criadas no schema. Resultado:
--   assinatura de gerador ou member_plus quebra em runtime.
--
-- Esta migration é idempotente.
-- ============================================

ALTER TABLE assinaturas
    ADD COLUMN IF NOT EXISTS tipo_plano TEXT
        NOT NULL DEFAULT 'consumidor'
        CHECK (tipo_plano IN ('consumidor', 'gerador', 'member_plus'));

ALTER TABLE assinaturas
    ADD COLUMN IF NOT EXISTS capacidade_kwp INTEGER;

CREATE INDEX IF NOT EXISTS idx_assinaturas_tipo_plano
    ON assinaturas(tipo_plano);

CREATE INDEX IF NOT EXISTS idx_assinaturas_user_tipo_status
    ON assinaturas(user_id, tipo_plano, status);

COMMENT ON COLUMN assinaturas.tipo_plano IS
    'Tipo do plano: consumidor (assinatura Lei 16), gerador (venda de excedente) ou member_plus (match prioritário).';
COMMENT ON COLUMN assinaturas.capacidade_kwp IS
    'Capacidade da usina em kWp. Preenchido apenas para tipo_plano=gerador.';
