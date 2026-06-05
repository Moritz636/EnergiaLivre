CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins_signup_bonus_claimed BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ,
    bonus_coins INTEGER NOT NULL DEFAULT 20 CHECK (bonus_coins > 0),
    inviter_bonus_coins INTEGER NOT NULL DEFAULT 20 CHECK (inviter_bonus_coins > 0),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_created_by ON coupons(created_by);
CREATE INDEX IF NOT EXISTS idx_coupons_used_by ON coupons(used_by);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own coupons" ON coupons;
CREATE POLICY "Users can view own coupons" ON coupons
    FOR SELECT USING (created_by = auth.uid() OR used_by = auth.uid());

DROP POLICY IF EXISTS "Users can create own coupons" ON coupons;
CREATE POLICY "Users can create own coupons" ON coupons
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS invoice_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_by_role TEXT NOT NULL CHECK (uploaded_by_role IN ('consumidor', 'embaixador')),
    cliente_nome TEXT,
    cliente_whatsapp TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'analyzed', 'matching', 'matched', 'failed')),
    estado TEXT,
    concessionaria TEXT,
    valor_total NUMERIC(10,2),
    kwh_mensal INTEGER,
    vencimento DATE,
    raw_extraction JSONB,
    error_message TEXT,
    match_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ,
    matched_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoice_uploads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoice_uploads(status);
CREATE INDEX IF NOT EXISTS idx_invoices_estado ON invoice_uploads(estado) WHERE estado IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_concessionaria ON invoice_uploads(concessionaria) WHERE concessionaria IS NOT NULL;

ALTER TABLE invoice_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON invoice_uploads;
CREATE POLICY "Users can view own invoices" ON invoice_uploads
    FOR SELECT USING (
        user_id = auth.uid()
        OR uploaded_by_role = 'embaixador' AND EXISTS (
            SELECT 1 FROM leads l
            WHERE l.whatsapp = invoice_uploads.cliente_whatsapp
              AND l.user_id = auth.uid()
              AND l.tipo = 'parceiro'
        )
    );

DROP POLICY IF EXISTS "Users can insert own invoices" ON invoice_uploads;
CREATE POLICY "Users can insert own invoices" ON invoice_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON invoice_uploads;
CREATE POLICY "Users can update own invoices" ON invoice_uploads
    FOR UPDATE USING (user_id = auth.uid());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoices', 'invoices', false, 10485760,
    ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/heic','image/heif',
          'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users can view own invoice files" ON storage.objects;
CREATE POLICY "Users can view own invoice files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'invoices'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can upload own invoice files" ON storage.objects;
CREATE POLICY "Users can upload own invoice files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'invoices'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can delete own invoice files" ON storage.objects;
CREATE POLICY "Users can delete own invoice files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'invoices'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_code := upper(substring(md5(random()::text || p_user_id::text) for 8));
        SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = v_code) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assign_referral_code_to_profile()
RETURNS TRIGGER AS $$
DECLARE
    v_code TEXT;
BEGIN
    IF NEW.referral_code IS NULL THEN
        v_code := generate_referral_code(NEW.id);
        NEW.referral_code := v_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_referral_code ON profiles;
CREATE TRIGGER trg_assign_referral_code
    BEFORE INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION assign_referral_code_to_profile();

UPDATE profiles SET referral_code = generate_referral_code(id)
WHERE referral_code IS NULL;

CREATE OR REPLACE FUNCTION create_invite_coupons()
RETURNS TRIGGER AS $$
DECLARE
    v_base TEXT;
    v_i INTEGER;
    v_code TEXT;
BEGIN
    v_base := UPPER(SUBSTRING(NEW.referral_code FROM 1 FOR 6));
    IF v_base IS NULL OR v_base = '' THEN
        v_base := UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
    END IF;
    FOR v_i IN 1..3 LOOP
        v_code := v_base || '-' || v_i;
        WHILE EXISTS(SELECT 1 FROM coupons WHERE code = v_code) LOOP
            v_code := v_code || substr(md5(random()::text), 1, 1);
        END LOOP;
        INSERT INTO coupons (code, created_by, bonus_coins, inviter_bonus_coins)
        VALUES (v_code, NEW.id, 20, 20);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_invite_coupons ON profiles;
CREATE TRIGGER trg_create_invite_coupons
    AFTER INSERT ON profiles
    FOR EACH ROW
    WHEN (NEW.referral_code IS NOT NULL)
    EXECUTE FUNCTION create_invite_coupons();

INSERT INTO coupons (code, created_by, bonus_coins, inviter_bonus_coins)
SELECT
    UPPER(SUBSTRING(p.referral_code FROM 1 FOR 6)) || '-' || s.i AS code,
    p.id,
    20,
    20
FROM profiles p
CROSS JOIN (VALUES (1), (2), (3)) AS s(i)
WHERE p.referral_code IS NOT NULL
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION redeem_coupon(
    p_code TEXT,
    p_user_id UUID
) RETURNS TABLE(success BOOLEAN, message TEXT, bonus_credited INTEGER, inviter_bonus_credited INTEGER, inviter_id UUID) AS $$
DECLARE
    v_coupon RECORD;
    v_new_balance INTEGER;
    v_inviter_balance INTEGER;
    v_inviter_id UUID;
BEGIN
    SELECT * INTO v_coupon
    FROM coupons
    WHERE code = UPPER(TRIM(p_code))
    FOR UPDATE;

    IF v_coupon IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Cupom invalido'::TEXT, 0, 0, NULL::UUID;
        RETURN;
    END IF;

    IF v_coupon.used_by IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, 'Cupom ja foi utilizado'::TEXT, 0, 0, v_coupon.created_by;
        RETURN;
    END IF;

    IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, 'Cupom expirado'::TEXT, 0, 0, v_coupon.created_by;
        RETURN;
    END IF;

    IF v_coupon.created_by = p_user_id THEN
        RETURN QUERY SELECT FALSE, 'Voce nao pode usar seu proprio cupom'::TEXT, 0, 0, v_coupon.created_by;
        RETURN;
    END IF;

    UPDATE coupons
    SET used_by = p_user_id,
        used_at = NOW()
    WHERE id = v_coupon.id;

    INSERT INTO coin_wallet (user_id, balance) VALUES (p_user_id, 0) ON CONFLICT DO NOTHING;
    SELECT credit_wallet(
        p_user_id,
        v_coupon.bonus_coins,
        'bonus'::coin_transaction_type,
        'Bonus de cupom: ' || v_coupon.code,
        NULL,
        NULL,
        NULL,
        'coupon',
        v_coupon.id::TEXT,
        jsonb_build_object('coupon_code', v_coupon.code)
    ) INTO v_new_balance;

    UPDATE profiles
    SET referred_by = v_coupon.created_by
    WHERE id = p_user_id AND referred_by IS NULL;

    v_inviter_id := v_coupon.created_by;
    SELECT credit_wallet(
        v_inviter_id,
        v_coupon.inviter_bonus_coins,
        'bonus'::coin_transaction_type,
        'Bonus por convite resgatado: ' || v_coupon.code,
        NULL,
        NULL,
        NULL,
        'coupon',
        v_coupon.id::TEXT,
        jsonb_build_object('coupon_code', v_coupon.code, 'invited_user_id', p_user_id)
    ) INTO v_inviter_balance;

    RETURN QUERY SELECT TRUE, 'Cupom resgatado com sucesso'::TEXT, v_coupon.bonus_coins, v_coupon.inviter_bonus_coins, v_inviter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'invoice_uploads') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE invoice_uploads;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Realtime nao disponivel (ok)';
END $$;

COMMENT ON TABLE coupons IS 'Cupons de convite: 3 por usuario, +20 moedas signup + 20 por invite confirmado. Apenas para desconto.';
COMMENT ON TABLE invoice_uploads IS 'Faturas uploaded para analise automatica de estado/concessionaria/valor e match com geradores.';
COMMENT ON COLUMN coupons.bonus_coins IS 'Moedas creditadas ao novo usuario (signup).';
COMMENT ON COLUMN coupons.inviter_bonus_coins IS 'Moedas creditadas ao criador do cupom quando o invite e resgatado.';
COMMENT ON FUNCTION redeem_coupon IS 'Resgata cupom: credita 20 ao novo user + 20 ao inviter, atomicamente. Idempotente via coupon.id unico.';
