# Aplicar Migration: Match + Member Plus

## Onde aplicar

Supabase Dashboard → https://supabase.com/dashboard/project/eahwyotzbskfjvsoqzw
→ **SQL Editor** (menu lateral esquerdo) → **New query**

## Como aplicar

1. Abra o arquivo `supabase/migrations/20260104_match_member_plus.sql`
2. **Selecione todo o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)
4. Cole no editor SQL do Supabase
5. Clique em **Run** (ou Ctrl+Enter)

## O que vai acontecer

A migration é **idempotente** (usa `IF NOT EXISTS` e `DROP POLICY IF EXISTS`), então pode ser rodada mais de uma vez sem erro.

Ela vai:
- Criar 2 tabelas novas: `user_locations`, `match_proposals`
- Adicionar 3 colunas em `profiles`: `member_plus_active`, `member_plus_activated_at`, `member_plus_expires_at`
- Adicionar 2 colunas em `leads`: `latitude`, `longitude`
- Criar 2 funções: `find_match_candidates(...)`, `expire_old_proposals()`
- Criar índices, triggers e RLS policies

## Pré-requisitos (importante!)

A função `update_updated_at_column()` **deve existir** no schema. Ela foi criada em uma migration anterior (`schema-improvements.sql` ou similar).

**Antes de rodar esta migration**, execute esta query para verificar:

```sql
SELECT proname FROM pg_proc WHERE proname = 'update_updated_at_column';
```

- Se retornar 1 linha → pode aplicar a migration diretamente
- Se retornar 0 linhas → rode isto antes:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Depois aplique a migration.

## Verificação pós-aplicação

Após rodar, valide com:

```sql
-- 1. Tabelas novas existem?
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_locations', 'match_proposals');
-- Esperado: 2 linhas

-- 2. Colunas member_plus em profiles?
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name LIKE 'member_plus%';
-- Esperado: 3 linhas (member_plus_active, member_plus_activated_at, member_plus_expires_at)

-- 3. Função find_match_candidates existe?
SELECT proname FROM pg_proc WHERE proname = 'find_match_candidates';
-- Esperado: 1 linha

-- 4. RLS habilitado?
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('user_locations', 'match_proposals');
-- Esperado: rowsecurity = t em ambas
```

## Rollback (se precisar)

```sql
DROP TABLE IF EXISTS match_proposals CASCADE;
DROP TABLE IF EXISTS user_locations CASCADE;
ALTER TABLE profiles
    DROP COLUMN IF EXISTS member_plus_active,
    DROP COLUMN IF EXISTS member_plus_activated_at,
    DROP COLUMN IF EXISTS member_plus_expires_at;
ALTER TABLE leads
    DROP COLUMN IF EXISTS latitude,
    DROP COLUMN IF EXISTS longitude;
DROP FUNCTION IF EXISTS find_match_candidates;
DROP FUNCTION IF EXISTS expire_old_proposals;
```

## Após aplicar

1. Marque a migration como aplicada (recomendado criar uma tabela de controle):

```sql
CREATE TABLE IF NOT EXISTS _migrations_applied (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO _migrations_applied (name) VALUES ('20260104_match_member_plus')
ON CONFLICT (name) DO NOTHING;
```

2. Volte aqui e me passe os **7 price_ids do Stripe** que você criou. Vou atualizar `lib/stripe-prices.ts` e subir.
