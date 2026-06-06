-- ============================================
-- Migration: 20260608_proposals
-- Tabela para armazenar propostas (PDFs) enviadas
-- pelos embaixadores para clientes finais.
-- ============================================
-- O PDF é gerado server-side via pdf-lib e armazenado
-- no Supabase Storage (bucket 'proposals'). Cada linha
-- representa 1 envio com metadados para auditoria.
-- ============================================

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    embaixador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Cliente
    client_name TEXT,
    client_email TEXT NOT NULL,
    client_whatsapp TEXT,
    client_cidade TEXT,
    client_estado TEXT,
    -- Dados da simulação
    gasto_mensal NUMERIC(10,2) NOT NULL CHECK (gasto_mensal > 0),
    economia_mensal NUMERIC(10,2) NOT NULL,
    economia_anual NUMERIC(10,2) NOT NULL,
    percentual_economia NUMERIC(5,2) NOT NULL,
    -- PDF gerado
    pdf_path TEXT NOT NULL,
    pdf_url TEXT,
    -- Status de envio
    send_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (send_status IN ('pending','sent','failed','queued')),
    send_error TEXT,
    sent_at TIMESTAMPTZ,
    -- Origem do envio (painel do embaixador vs simulador público)
    source TEXT NOT NULL DEFAULT 'embaixador-panel'
        CHECK (source IN ('embaixador-panel','simulador-publico')),
    -- Validade da proposta (48h)
    valid_until TIMESTAMPTZ NOT NULL,
    -- Auditoria
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_embaixador
    ON proposals(embaixador_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposals_email
    ON proposals(client_email, created_at DESC);

-- RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Embaixador pode ver apenas as próprias propostas
DROP POLICY IF EXISTS "Embaixadores veem próprias propostas" ON proposals;
CREATE POLICY "Embaixadores veem próprias propostas" ON proposals
    FOR SELECT USING (auth.uid() = embaixador_id);

-- Embaixador pode inserir (API faz a validação)
DROP POLICY IF EXISTS "Embaixadores inserem próprias propostas" ON proposals;
CREATE POLICY "Embaixadores inserem próprias propostas" ON proposals
    FOR INSERT WITH CHECK (auth.uid() = embaixador_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_proposals_updated_at ON proposals;
CREATE TRIGGER trg_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKET: proposals
-- ============================================
-- Bucket público para download dos PDFs (URL assinada de 7 dias
-- é gerada pela API; a tabela guarda a referência).
-- Criar manualmente no Supabase Dashboard > Storage > New bucket:
--   Name: proposals
--   Public: true (somente leitura)
-- ============================================

COMMENT ON TABLE proposals IS 'Propostas comerciais (PDFs) enviadas por embaixadores a clientes finais. Validade de 48h.';
COMMENT ON COLUMN proposals.valid_until IS 'Data de expiração da proposta (created_at + 48h).';
COMMENT ON COLUMN proposals.send_status IS 'pending=em processamento | sent=email enviado | failed=falha | queued=aguardando provedor';
