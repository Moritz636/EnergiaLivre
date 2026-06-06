-- ============================================
-- Migration: 20260606_cto_master_plus
-- CTO Master Plus Modo GOD
-- ============================================
-- Adições:
--  1. invoice_uploads: geo + barcode + match_eligible
--  2. geradores: preco/desconto/pacotes/ranking
--  3. Tabela: token_pre_registrations
--  4. Tabela: pix_payments
--  5. Tabela: celular_recargas
--  6. RPCs: is_high_consumption_invoice, recompute_generator_ranking
-- ============================================

-- 1) INVOICE_UPLOADS - geo + barcode + match eligibility
ALTER TABLE invoice_uploads
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7),
    ADD COLUMN IF NOT EXISTS endereco TEXT,
    ADD COLUMN IF NOT EXISTS barcode_payload TEXT,
    ADD COLUMN IF NOT EXISTS barcode_type TEXT CHECK (barcode_type IN ('linha_digitavel','qrcode','itf','code128','other')),
    ADD COLUMN IF NOT EXISTS match_eligible BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS match_eligible_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'upload' CHECK (source IN ('upload','scan','manual'));

CREATE INDEX IF NOT EXISTS idx_invoices_match_eligible
    ON invoice_uploads(user_id, kwh_mensal DESC)
    WHERE match_eligible = true;

CREATE INDEX IF NOT EXISTS idx_invoices_geo
    ON invoice_uploads(latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

DROP POLICY IF EXISTS "High-consumption invoices are public for match" ON invoice_uploads;
CREATE POLICY "High-consumption invoices are public for match" ON invoice_uploads
    FOR SELECT USING (
        match_eligible = true
        AND kwh_mensal >= 300
    );

-- 2) GERADORES - pricing + packages + ranking
ALTER TABLE geradores
    ADD COLUMN IF NOT EXISTS preco_kwh NUMERIC(8,4) DEFAULT 0.6650,
    ADD COLUMN IF NOT EXISTS desconto_percentual NUMERIC(5,2) DEFAULT 5.00,
    ADD COLUMN IF NOT EXISTS pacote_kwh INTEGER DEFAULT 100,
    ADD COLUMN IF NOT EXISTS pacote_preco NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS ranking_score NUMERIC(10,4) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_avaliacoes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS media_avaliacoes NUMERIC(3,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_geradores_ranking
    ON geradores(ranking_score DESC, preco_kwh ASC)
    WHERE status = 'ativo';

CREATE INDEX IF NOT EXISTS idx_geradores_status_ativo
    ON geradores(status)
    WHERE status = 'ativo';

-- 3) TABELA: token_pre_registrations (landing /token)
CREATE TABLE IF NOT EXISTS token_pre_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    wallet_address TEXT,
    package_code TEXT,
    package_tokens INTEGER,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referred_by_code TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','launched')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_pre_email ON token_pre_registrations(email);
CREATE INDEX IF NOT EXISTS idx_token_pre_status ON token_pre_registrations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_pre_referred_by ON token_pre_registrations(referred_by_code)
    WHERE referred_by_code IS NOT NULL;

ALTER TABLE token_pre_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can register interest" ON token_pre_registrations;
CREATE POLICY "Anyone can register interest" ON token_pre_registrations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view token pre-registrations" ON token_pre_registrations;
CREATE POLICY "Admins can view token pre-registrations" ON token_pre_registrations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    );

-- 4) TABELA: pix_payments
CREATE TABLE IF NOT EXISTS pix_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    purpose TEXT NOT NULL CHECK (purpose IN ('coin_purchase','plan_subscription','token_presale','invoice_payment','celular_recharge','other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','expired','cancelled','refunded','failed')),
    txid TEXT UNIQUE,
    qr_code TEXT,
    qr_code_image TEXT,
    pix_copy_paste TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    provider TEXT DEFAULT 'mock',
    provider_payload JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pix_user ON pix_payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pix_status ON pix_payments(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_pix_txid ON pix_payments(txid) WHERE txid IS NOT NULL;

ALTER TABLE pix_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pix" ON pix_payments;
CREATE POLICY "Users can view own pix" ON pix_payments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own pix" ON pix_payments;
CREATE POLICY "Users can create own pix" ON pix_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all pix" ON pix_payments;
CREATE POLICY "Admins manage all pix" ON pix_payments
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- 5) TABELA: celular_recargas
CREATE TABLE IF NOT EXISTS celular_recargas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    numero TEXT NOT NULL,
    operadora TEXT,
    valor NUMERIC(10,2) NOT NULL,
    pix_payment_id UUID REFERENCES pix_payments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','completed','failed','refunded')),
    provider TEXT DEFAULT 'mock',
    provider_payload JSONB,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recargas_user ON celular_recargas(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recargas_status ON celular_recargas(status);

ALTER TABLE celular_recargas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own recargas" ON celular_recargas;
CREATE POLICY "Users manage own recargas" ON celular_recargas
    FOR ALL USING (auth.uid() = user_id);

-- 6) RPC: is_high_consumption_invoice
CREATE OR REPLACE FUNCTION is_high_consumption_invoice(p_invoice_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_kwh INTEGER;
BEGIN
    SELECT kwh_mensal INTO v_kwh FROM invoice_uploads WHERE id = p_invoice_id;
    RETURN (v_kwh IS NOT NULL AND v_kwh >= 300);
END;
$$;

-- 7) RPC: recompute_generator_ranking (calcula score baseado em preco + avaliacoes)
CREATE OR REPLACE FUNCTION recompute_generator_ranking()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_baseline_kwh NUMERIC := 0.95;
BEGIN
    -- score = (1 - preco_kwh/baseline) * 100 * 0.7 + media_avaliacoes * 20 * 0.3
    UPDATE geradores
    SET ranking_score =
        COALESCE(((1 - (preco_kwh / v_baseline_kwh)) * 100), 0) * 0.7
        + COALESCE(media_avaliacoes, 0) * 20 * 0.3,
        updated_at = NOW()
    WHERE status = 'ativo';
END;
$$;

-- Atualizar trigger updated_at
DROP TRIGGER IF EXISTS update_pix_payments_updated_at ON pix_payments;
CREATE TRIGGER update_pix_payments_updated_at
    BEFORE UPDATE ON pix_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recargas_updated_at ON celular_recargas;
CREATE TRIGGER update_recargas_updated_at
    BEFORE UPDATE ON celular_recargas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_token_pre_updated_at ON token_pre_registrations;
CREATE TRIGGER update_token_pre_updated_at
    BEFORE UPDATE ON token_pre_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8) Comentários
COMMENT ON TABLE token_pre_registrations IS 'Pré-registros da landing /token - token utilitário KWATT';
COMMENT ON TABLE pix_payments IS 'Pagamentos PIX gerados pelo sistema (abstração de provedor)';
COMMENT ON TABLE celular_recargas IS 'Recargas de celular dos usuários usando saldo/moedas';
COMMENT ON COLUMN invoice_uploads.match_eligible IS 'TRUE quando kwh_mensal >= 300 - aparece no mapa de match';
COMMENT ON COLUMN geradores.ranking_score IS 'Score para ranking: 70% preço + 30% avaliação';
COMMENT ON COLUMN geradores.preco_kwh IS 'Preço sugerido do kWh (deve ser 5-10% menor que a tarifa padrão R$ 0,95)';
