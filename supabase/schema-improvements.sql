-- ============================================
-- MELHORIAS DE PERFORMANCE E ESCALABILIDADE
-- ENERGIALIVRE v2.0
-- ============================================
-- Este arquivo deve ser executado APÓS o schema.sql inicial
-- Contém: índices, materialized views, RLS otimizado, funções auxiliares

-- ============================================
-- 1. CORREÇÃO DE BUGS E ÍNDICES
-- ============================================

-- Corrigir índice com nome de coluna errado
DROP INDEX IF EXISTS idx_comissoes_data_pagamento;
CREATE INDEX IF NOT EXISTS idx_comissoes_data_pagamento ON comissoes(data_pagamento);

-- Índices faltantes para FKs críticas
CREATE INDEX IF NOT EXISTS idx_leads_processed_by ON leads(processed_by);
CREATE INDEX IF NOT EXISTS idx_relatorios_gerado_por ON relatorios(gerado_por);
CREATE INDEX IF NOT EXISTS idx_comissoes_stripe_pi ON comissoes(stripe_payment_intent);
CREATE INDEX IF NOT EXISTS idx_assinaturas_user_status ON assinaturas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_user_created ON pagamentos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consumidores_plano_ativo ON consumidores(plano_ativo) WHERE plano_ativo = true;
CREATE INDEX IF NOT EXISTS idx_geradores_status_ativo ON geradores(status) WHERE status = 'ativo';

-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_leads_tipo_status ON leads(tipo, status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_period_end_status ON assinaturas(current_period_end, status);
CREATE INDEX IF NOT EXISTS idx_comissoes_embaixador_status ON comissoes(embaixador_id, status_pagamento);
CREATE INDEX IF NOT EXISTS idx_matches_gerador_status ON matches(gerador_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_consumidor_status ON matches(consumidor_id, status);

-- ============================================
-- 2. TABELA DE CACHE DE ESTATÍSTICAS
-- ============================================

CREATE TABLE IF NOT EXISTS stats_cache (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_usuarios INTEGER DEFAULT 0,
    total_geradores INTEGER DEFAULT 0,
    total_consumidores INTEGER DEFAULT 0,
    total_leads INTEGER DEFAULT 0,
    leads_pendentes INTEGER DEFAULT 0,
    leads_aprovados INTEGER DEFAULT 0,
    leads_recusados INTEGER DEFAULT 0,
    assinaturas_ativas INTEGER DEFAULT 0,
    faturamento_mensal DECIMAL(12,2) DEFAULT 0,
    total_comissoes_pagas DECIMAL(12,2) DEFAULT 0,
    total_comissoes_pendentes DECIMAL(12,2) DEFAULT 0,
    volume_transacoes DECIMAL(12,2) DEFAULT 0,
    economia_total_gerada DECIMAL(12,2) DEFAULT 0,
    kwh_total_gerado INTEGER DEFAULT 0,
    co2_total_evitado INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO stats_cache (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Função para atualizar o cache
CREATE OR REPLACE FUNCTION refresh_stats_cache() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO stats_cache (
        id, total_usuarios, total_geradores, total_consumidores,
        total_leads, leads_pendentes, leads_aprovados, leads_recusados,
        assinaturas_ativas, faturamento_mensal, total_comissoes_pagas,
        total_comissoes_pendentes, volume_transacoes, economia_total_gerada,
        kwh_total_gerado, co2_total_evitado, updated_at
    )
    SELECT
        1,
        (SELECT COUNT(*) FROM profiles),
        (SELECT COUNT(*) FROM profiles WHERE tipo = 'gerador'),
        (SELECT COUNT(*) FROM profiles WHERE tipo = 'consumidor'),
        (SELECT COUNT(*) FROM leads),
        (SELECT COUNT(*) FROM leads WHERE status = 'pendente'),
        (SELECT COUNT(*) FROM leads WHERE status = 'aprovado'),
        (SELECT COUNT(*) FROM leads WHERE status = 'recusado'),
        (SELECT COUNT(*) FROM assinaturas WHERE status = 'active'),
        (SELECT COALESCE(SUM(valor_mensal), 0) FROM assinaturas WHERE status = 'active'),
        (SELECT COALESCE(SUM(valor_comissao), 0) FROM comissoes WHERE status_pagamento = 'pago'),
        (SELECT COALESCE(SUM(valor_comissao), 0) FROM comissoes WHERE status_pagamento = 'pendente'),
        (SELECT COALESCE(SUM(valor_transacao), 0) FROM matches WHERE status = 'active'),
        (SELECT COALESCE(SUM(economia_total), 0) FROM consumidores),
        (SELECT COALESCE(SUM(kwh_consumidos), 0) FROM consumidores),
        (SELECT COALESCE(SUM(co2_evitado_kg), 0) FROM consumidores),
        NOW()
    ON CONFLICT (id) DO UPDATE SET
        total_usuarios = EXCLUDED.total_usuarios,
        total_geradores = EXCLUDED.total_geradores,
        total_consumidores = EXCLUDED.total_consumidores,
        total_leads = EXCLUDED.total_leads,
        leads_pendentes = EXCLUDED.leads_pendentes,
        leads_aprovados = EXCLUDED.leads_aprovados,
        leads_recusados = EXCLUDED.leads_recusados,
        assinaturas_ativas = EXCLUDED.assinaturas_ativas,
        faturamento_mensal = EXCLUDED.faturamento_mensal,
        total_comissoes_pagas = EXCLUDED.total_comissoes_pagas,
        total_comissoes_pendentes = EXCLUDED.total_comissoes_pendentes,
        volume_transacoes = EXCLUDED.volume_transacoes,
        economia_total_gerada = EXCLUDED.economia_total_gerada,
        kwh_total_gerado = EXCLUDED.kwh_total_gerado,
        co2_total_evitado = EXCLUDED.co2_total_evitado,
        updated_at = NOW();

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function wrapper
CREATE OR REPLACE FUNCTION trigger_refresh_stats() RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_stats_cache();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar stats automaticamente
DROP TRIGGER IF EXISTS stats_on_profile_change ON profiles;
CREATE TRIGGER stats_on_profile_change
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_stats();

DROP TRIGGER IF EXISTS stats_on_lead_change ON leads;
CREATE TRIGGER stats_on_lead_change
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_stats();

DROP TRIGGER IF EXISTS stats_on_assinatura_change ON assinaturas;
CREATE TRIGGER stats_on_assinatura_change
    AFTER INSERT OR UPDATE OR DELETE ON assinaturas
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_stats();

DROP TRIGGER IF EXISTS stats_on_comissao_change ON comissoes;
CREATE TRIGGER stats_on_comissao_change
    AFTER INSERT OR UPDATE OR DELETE ON comissoes
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_stats();

DROP TRIGGER IF EXISTS stats_on_match_change ON matches;
CREATE TRIGGER stats_on_match_change
    AFTER INSERT OR UPDATE OR DELETE ON matches
    FOR EACH STATEMENT EXECUTE FUNCTION trigger_refresh_stats();

-- Substituir a view antiga pela leitura do cache
DROP VIEW IF EXISTS view_estatisticas_sistema;
CREATE OR REPLACE VIEW view_estatisticas_sistema AS
SELECT
    total_usuarios,
    total_geradores,
    total_consumidores,
    total_leads,
    leads_aprovados,
    assinaturas_ativas,
    faturamento_mensal,
    total_comissoes_pagas AS total_comissoes,
    volume_transacoes,
    updated_at
FROM stats_cache WHERE id = 1;

-- ============================================
-- 3. TABELA DE LOGS DE AUDITORIA
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- RLS para audit_logs (apenas admins podem ler)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- ============================================
-- 4. TABELA DE NOTIFICAÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'payment', 'commission', 'lead')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert notifications" ON notifications;
CREATE POLICY "Service can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 5. TABELA DE INDICAÇÕES (REFERRAL)
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'convertido', 'expirado')),
    converted_at TIMESTAMPTZ,
    commission_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
CREATE POLICY "Users can create referrals" ON referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Adicionar coluna referral_code em profiles se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Função para gerar código de indicação único
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_referral_code ON profiles;
CREATE TRIGGER set_referral_code
    BEFORE INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- ============================================
-- 6. FUNÇÕES AUXILIARES DE NEGÓCIO
-- ============================================

-- Função para calcular economia estimada baseado em kWh
CREATE OR REPLACE FUNCTION calcular_economia_estimada(
    kwh_mensal INTEGER,
    tarifa_kwh DECIMAL DEFAULT 0.95
) RETURNS TABLE(
    economia_reais DECIMAL,
    economia_percentual DECIMAL,
    co2_evitado DECIMAL,
    arvores_equivalentes DECIMAL
) AS $$
DECLARE
    v_gasto_mensal DECIMAL;
    v_economia DECIMAL;
    v_percentual DECIMAL;
BEGIN
    v_gasto_mensal := kwh_mensal * tarifa_kwh;
    v_economia := v_gasto_mensal * 0.25; -- 25% economia média
    v_percentual := 25.0;

    RETURN QUERY SELECT
        v_economia,
        v_percentual,
        (kwh_mensal * 0.0817)::DECIMAL, -- kg CO2 por kWh solar
        (kwh_mensal * 0.0817 / 22)::DECIMAL; -- 22kg CO2/árvore/ano
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação
CREATE OR REPLACE FUNCTION criar_notificacao(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    v_id BIGINT;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_link, p_metadata)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. RLS OTIMIZADO (USA JWT CLAIMS)
-- ============================================
-- IMPORTANTE: Requer Auth Hook configurado no Supabase Dashboard
-- que adiciona 'user_role' ao JWT

-- Função helper para extrair role do JWT
CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        auth.jwt() ->> 'user_role',
        (SELECT role FROM profiles WHERE id = auth.uid())
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Atualizar RLS policies para usar JWT quando possível
DROP POLICY IF EXISTS "Admin can view all leads" ON leads;
CREATE POLICY "Admin can view all leads" ON leads
    FOR SELECT USING (
        current_user_role() = 'admin' OR auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Admin can update leads" ON leads;
CREATE POLICY "Admin can update leads" ON leads
    FOR UPDATE USING (current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin can view all assinaturas" ON assinaturas;
CREATE POLICY "Admin can view all assinaturas" ON assinaturas
    FOR SELECT USING (
        current_user_role() = 'admin' OR auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Admin can view all comissoes" ON comissoes;
CREATE POLICY "Admin can view all comissoes" ON comissoes
    FOR SELECT USING (
        current_user_role() = 'admin' OR auth.uid() = embaixador_id
    );

-- ============================================
-- 8. ATUALIZAR STATS INICIALMENTE
-- ============================================
SELECT refresh_stats_cache();

-- ============================================
-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE stats_cache IS 'Cache pré-computado de estatísticas do sistema. Atualizado por triggers.';
COMMENT ON TABLE audit_logs IS 'Log de auditoria de todas ações críticas do sistema.';
COMMENT ON TABLE notifications IS 'Notificações in-app para usuários.';
COMMENT ON TABLE referrals IS 'Sistema de indicações entre usuários.';
COMMENT ON FUNCTION refresh_stats_cache() IS 'Recalcula todas as estatísticas do sistema. Chamada por triggers.';
COMMENT ON FUNCTION criar_notificacao IS 'Cria uma notificação para um usuário. Use via service role.';
COMMENT ON FUNCTION current_user_role() IS 'Retorna a role do usuário atual. Prefere JWT claim para performance.';
