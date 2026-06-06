-- =====================================================
-- ENERGIALIVRE — Migration 20260605 (ADMIN GOD MODE)
-- Cole no Supabase SQL Editor → New query → Run
-- =====================================================
-- Ativa as 4 secoes placeholder do admin dashboard:
--   * Financeiro  (pagamentos, assinaturas)         -- ja existem
--   * Match       (match_proposals)                  -- ja existe
--   * Cupons      (coupons)                          -- ja existe
--   * Configuracoes (system_settings)                 -- NOVA
--
-- Tambem promove o admin fundador:
--   fiscaltecnico.qualidade@gmail.com -> role=admin
-- Idempotente: rodar mais de uma vez nao quebra.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 0. DEFENSIVO: garantir colunas/funcao que esta migration toca
-- =====================================================
-- Algumas instancias estao com schema profiles/admins antigo
-- (sem updated_at, sem role, etc). Sem isso os UPDATEs quebram.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'ND';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cidade TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nome TEXT;

-- Tabela admins pode ter sido criada sem role/nome/updated_at
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin'));
ALTER TABLE admins ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Garante que email e UNIQUE (necessario para ON CONFLICT (email))
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'admins_email_key'
          AND conrelid = 'admins'::regclass
    ) THEN
        ALTER TABLE admins ADD CONSTRAINT admins_email_key UNIQUE (email);
    END IF;
END $$;

-- =====================================================
-- 1. TABELA: system_settings
-- =====================================================
-- Key/value store para configuracoes editaveis pelo admin
-- (percentuais de comissao, limites, features flags, etc.)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general'
        CHECK (category IN ('general', 'commissions', 'email', 'features', 'integrations')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler settings publicas
DROP POLICY IF EXISTS "Anyone can read public settings" ON system_settings;
CREATE POLICY "Anyone can read public settings" ON system_settings
    FOR SELECT USING (is_public = true);

-- Admins podem tudo
DROP POLICY IF EXISTS "Admins can manage settings" ON system_settings;
CREATE POLICY "Admins can manage settings" ON system_settings
    FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- =====================================================
-- 2. SEED: configuracoes padrao
-- =====================================================
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
    ('commission.signup_percent', '15'::jsonb, 'Percentual de comissao no cadastro do cliente', 'commissions', false),
    ('commission.recurring_percent', '10'::jsonb, 'Percentual de comissao recorrente mensal', 'commissions', false),
    ('commission.ufv_percent', '15'::jsonb, 'Percentual retido pela UFV (gerador)', 'commissions', false),
    ('commission.embaixador_percent', '5'::jsonb, 'Percentual bonus para embaixador que indicou', 'commissions', false),
    ('email.daily_limit', '100'::jsonb, 'Limite diario de envios (Resend free tier)', 'email', false),
    ('email.from_address', '"noreply@energialivre.dev.br"'::jsonb, 'Remetente padrao dos e-mails transacionais', 'email', false),
    ('email.from_name', '"EnergiaLivre"'::jsonb, 'Nome de exibicao do remetente', 'email', false),
    ('features.coupons_enabled', 'true'::jsonb, 'Sistema de cupons ativo', 'features', true),
    ('features.match_enabled', 'true'::jsonb, 'Match consumidor-gerador ativo', 'features', true),
    ('features.member_plus_enabled', 'true'::jsonb, 'Plano Member+ ativo', 'features', true),
    ('integrations.stripe_enabled', 'true'::jsonb, 'Stripe em modo producao', 'integrations', false),
    ('integrations.resend_enabled', 'true'::jsonb, 'Resend em modo producao', 'integrations', false),
    ('general.maintenance_mode', 'false'::jsonb, 'Bloqueia cadastros e operacoes na plataforma', 'general', false),
    ('general.support_whatsapp', '"5584987858668"'::jsonb, 'WhatsApp de suporte (DDI+DDD+numero)', 'general', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 3. PROMOVER ADMIN FUNDADOR
-- =====================================================
-- Sobe para admin a conta de controle do projeto.
-- Idempotente.

UPDATE profiles
SET role = 'admin',
    tipo = COALESCE(tipo, 'admin'),
    updated_at = NOW()
WHERE email = 'fiscaltecnico.qualidade@gmail.com';

INSERT INTO admins (id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'fiscaltecnico.qualidade@gmail.com'
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- Garante que existe profile mesmo que trigger handle_new_user
-- nao tenha rodado (defensivo)
INSERT INTO profiles (id, email, nome, tipo, role, whatsapp, cidade, estado)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'nome', 'Admin EnergiaLivre'),
    'admin',
    'admin',
    COALESCE(au.raw_user_meta_data->>'whatsapp', ''),
    COALESCE(au.raw_user_meta_data->>'cidade', ''),
    COALESCE(au.raw_user_meta_data->>'estado', '')
FROM auth.users au
WHERE au.email = 'fiscaltecnico.qualidade@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', tipo = 'admin', updated_at = NOW();

-- =====================================================
-- 4. VIEW: admin_dashboard_stats (consolidada)
-- =====================================================
-- Uma unica query que retorna todas as estatisticas
-- que o admin precisa. Performance: indexes ja criados
-- nas tabelas base.
DROP VIEW IF EXISTS admin_dashboard_stats;
CREATE VIEW admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles)                                                            AS total_usuarios,
    (SELECT COUNT(*) FROM profiles WHERE tipo = 'parceiro')                                    AS total_embaixadores,
    (SELECT COUNT(*) FROM profiles WHERE tipo = 'gerador')                                      AS total_geradores,
    (SELECT COUNT(*) FROM profiles WHERE tipo = 'consumidor' OR tipo IS NULL)                  AS total_consumidores,
    (SELECT COUNT(*) FROM leads)                                                               AS total_leads,
    (SELECT COUNT(*) FROM leads WHERE status IS NULL OR status = 'pendente')                   AS leads_pendentes,
    (SELECT COUNT(*) FROM leads WHERE status = 'aprovado')                                     AS leads_aprovados,
    (SELECT COUNT(*) FROM leads WHERE status = 'recusado')                                     AS leads_recusados,
    (SELECT COALESCE(SUM(valor_comissao), 0) FROM comissoes WHERE status_pagamento = 'pago')   AS comissoes_pagas_total,
    (SELECT COALESCE(SUM(valor_comissao), 0) FROM comissoes WHERE status_pagamento = 'pendente') AS comissoes_pendentes_total,
    (SELECT COUNT(*) FROM comissoes WHERE status_pagamento = 'pendente')                       AS comissoes_pendentes_count,
    (SELECT COALESCE(SUM(valor), 0) FROM pagamentos WHERE status = 'succeeded')               AS faturamento_total,
    (SELECT COALESCE(SUM(valor), 0) FROM pagamentos
        WHERE status = 'succeeded'
          AND created_at >= date_trunc('month', NOW()))                                         AS faturamento_mensal,
    (SELECT COUNT(*) FROM assinaturas WHERE status = 'active')                                 AS assinaturas_ativas,
    (SELECT COUNT(*) FROM match_proposals WHERE status = 'pending')                            AS match_propostas_pendentes,
    (SELECT COUNT(*) FROM match_proposals WHERE status = 'accepted')                           AS match_propostas_aceitas,
    (SELECT COUNT(*) FROM coupons WHERE used_by IS NOT NULL)                                   AS cupons_resgatados,
    (SELECT COUNT(*) FROM coupons)                                                             AS cupons_total;

COMMENT ON VIEW admin_dashboard_stats IS
    'Estatisticas consolidadas para o admin dashboard. Leitura via SELECT simples.';

-- =====================================================
-- 5. RLS para a view (Postgres não aplica RLS em views,
--    mas a view só faz SELECT em tabelas com RLS.
--    Admins vao conseguir ler tudo via RLS policies
--    existentes que checam a tabela admins.)
-- =====================================================

-- =====================================================
-- 6. FUNCAO: is_admin() ja existe (migration 20260111)
--    Garantimos que ainda existe:
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());
END;
$$ language 'plpgsql' SECURITY DEFINER STABLE;

COMMENT ON TABLE system_settings IS
    'Configuracoes do sistema editaveis pelo admin. Key/value com categoria.';
COMMENT ON COLUMN system_settings.is_public IS
    'Se true, usuarios autenticados podem ler (ex: whatsapp de suporte).';
