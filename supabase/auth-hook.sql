-- ============================================
-- SUPABASE AUTH HOOK: Adicionar user_role ao JWT
-- ============================================
-- Este script deve ser configurado em:
-- Supabase Dashboard → Authentication → Hooks → Custom Access Token
--
-- Permite que RLS policies leiam a role do JWT diretamente
-- sem precisar de subquery em profiles (O(1) vs O(n))

-- ============================================
-- PASSO 1: Criar função que adiciona user_role ao JWT
-- ============================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role text;
    user_tipo text;
BEGIN
    -- Buscar role e tipo do usuário
    SELECT role, tipo INTO user_role, user_tipo
    FROM public.profiles
    WHERE id = (event->>'user_id')::uuid;

    -- Claims originais
    claims := event->'claims';

    -- Adicionar role e tipo
    IF claims ? 'app_metadata' THEN
        claims := jsonb_set(
            claims,
            '{app_metadata}',
            claims->'app_metadata' || jsonb_build_object(
                'user_role', COALESCE(user_role, 'user'),
                'user_tipo', COALESCE(user_tipo, 'consumidor')
            )
        );
    ELSE
        claims := claims || jsonb_build_object(
            'app_metadata', jsonb_build_object(
                'user_role', COALESCE(user_role, 'user'),
                'user_tipo', COALESCE(user_tipo, 'consumidor')
            )
        );
    END IF;

    -- Retornar evento modificado
    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
END;
$$;

-- ============================================
-- PASSO 2: Conceder permissões
-- ============================================
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;

-- ============================================
-- PASSO 3: Configurar o hook no Supabase
-- ============================================
-- No Supabase Dashboard:
-- 1. Vá em Authentication → Hooks
-- 2. Selecione "Custom Access Token"
-- 3. Ative o hook
-- 4. Selecione o schema "public" e a função "custom_access_token_hook"
-- 5. Salve

-- ============================================
-- PASSO 4: Verificar se está funcionando
-- ============================================
-- Faça login e verifique o JWT em:
-- https://energia-livre.vercel.app/api/health
-- (adicionar debug temporário)
--
-- O JWT deve conter: app_metadata.user_role e app_metadata.user_tipo

-- ============================================
-- NOTA: Após ativar o hook, as RLS policies usarão
-- a função current_user_role() que extrai do JWT
-- em vez de fazer subquery em profiles
-- ============================================
