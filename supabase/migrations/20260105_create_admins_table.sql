-- ============================================
-- MIGRATION 20260105: TABELA ADMINS (PARA RLS)
-- EnergiaLivre v2.1
-- ============================================
-- A migration 20260104_match_member_plus.sql referencia
--     EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
-- nas policies de user_locations e match_proposals.
--
-- Porem nenhuma migration cria a tabela `admins`.
-- Resultado: queries nessas tabelas quebram com
--            "relation admins does not exist".
--
-- Esta migration cria a tabela admins (espelho de profiles
-- com role='admin') e a popula a partir de profiles.
--
-- Apos aplicar, a tabela admins pode ser mantida em sincronia
-- via trigger (opcional - ver secao 4).
-- ============================================

-- ============================================
-- 1. CRIAR TABELA ADMINS
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nome TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. RLS NA TABELA ADMINS
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admin pode ler a tabela admins
DROP POLICY IF EXISTS "Admins can view admins" ON admins;
CREATE POLICY "Admins can view admins" ON admins
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins a2 WHERE a2.id = auth.uid())
    );

-- Admin pode inserir (cuidado - em produção, faça via service_role)
DROP POLICY IF EXISTS "Admins can insert admins" ON admins;
CREATE POLICY "Admins can insert admins" ON admins
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM admins a2 WHERE a2.id = auth.uid())
    );

-- Admin pode atualizar
DROP POLICY IF EXISTS "Admins can update admins" ON admins;
CREATE POLICY "Admins can update admins" ON admins
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admins a2 WHERE a2.id = auth.uid())
    );

-- ============================================
-- 3. POPULAR COM ADMINS EXISTENTES (de profiles.role)
-- ============================================
INSERT INTO admins (id, email, nome, role)
SELECT
    p.id,
    p.email,
    p.nome,
    CASE WHEN p.tipo = 'admin' THEN 'super_admin' ELSE 'admin' END
FROM profiles p
WHERE p.role = 'admin'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. TRIGGER: AUTO-PROMOVER PARA ADMINS
-- ============================================
-- Quando profiles.role muda para 'admin', o usuario e
-- automaticamente inserido em admins. Quando muda para outro
-- valor, e removido.

CREATE OR REPLACE FUNCTION sync_admins_from_profiles() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'admin' THEN
        INSERT INTO admins (id, email, nome, role)
        VALUES (NEW.id, NEW.email, NEW.nome, 'admin')
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            nome = EXCLUDED.nome,
            updated_at = NOW();
    ELSE
        DELETE FROM admins WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_sync_admins ON profiles;
CREATE TRIGGER profiles_sync_admins
    AFTER INSERT OR UPDATE OF role, email, nome ON profiles
    FOR EACH ROW EXECUTE FUNCTION sync_admins_from_profiles();

-- ============================================
-- 5. COMENTARIOS
-- ============================================
COMMENT ON TABLE admins IS
    'Tabela de administradores. Usada pelas RLS policies (user_locations, match_proposals) para verificar acesso admin. Mantida em sincronia com profiles.role via trigger.';
