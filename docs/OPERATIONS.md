# EnergiaLivre - Guia de Operações

> Documento vivo com tudo o que precisa ser feito em deploy, monitoramento e troubleshooting.

---

## 1. Pré-Deploy (obrigatório)

### 1.1 Banco de Dados (Supabase)

Aplicar migrations na ordem, no SQL Editor do Supabase:

| # | Arquivo | O que faz |
|---|---------|-----------|
| 1 | `supabase/schema.sql` | Schema base (profiles, leads, geradores, consumidores, assinaturas, comissoes, pagamentos, matches, relatorios) |
| 2 | `supabase/schema-improvements.sql` | Índices, `stats_cache`, audit_logs, notifications, referrals, RLS otimizado |
| 3 | `supabase/migrations/20260104_match_member_plus.sql` | Tabelas `user_locations`, `match_proposals`, colunas `member_plus_*`, função `find_match_candidates` |
| 4 | `supabase/migrations/20260105_assinatura_tipo_plano.sql` | Colunas `tipo_plano` e `capacidade_kwp` em `assinaturas` (corrige bug do webhook para gerador/member_plus) |
| 5 | `supabase/migrations/20260105_create_admins_table.sql` | Cria tabela `admins` referenciada pelas RLS policies (corrige bug crítico) |
| 6 | `supabase/auth-hook.sql` | Função `custom_access_token_hook` para adicionar `user_role` ao JWT (não executa GRANTs, requer etapa manual no Dashboard) |

> ⚠️ Migrations 4 e 5 são **críticas** e corrigem bugs que vão quebrar a app em produção se não aplicadas.

**Validação pós-deploy:**

```sql
-- 1. Colunas novas em assinaturas
SELECT column_name FROM information_schema.columns
WHERE table_name = 'assinaturas' AND column_name IN ('tipo_plano', 'capacidade_kwp');
-- Esperado: 2 linhas

-- 2. Tabela admins
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins');
-- Esperado: true

-- 3. Função de match
SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'find_match_candidates');
-- Esperado: true
```

### 1.2 Supabase Auth Hook (Dashboard)

1. SQL Editor → executar `supabase/auth-hook.sql`
2. **Authentication → Hooks → Custom Access Token → Enable**
3. Schema: `public` | Função: `custom_access_token_hook`
4. Salvar

Verificação pós-config: fazer login e checar o JWT em `/api/health` (response terá `app_metadata.user_role`).

### 1.3 Variáveis de Ambiente (Vercel)

| Variável | Obrigatória | Onde obter |
|----------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Dashboard → Webhooks → endpoint |
| `NEXT_PUBLIC_SITE_URL` | ✅ (prod) | URL canônica (ex: `https://energialivre.com.br`) |
| `ADMIN_EMAIL` | Recomendável | Email do admin principal |
| `NEXT_PUBLIC_SENTRY_DSN` | Opcional | Sentry → Project Settings |
| `SENTRY_DSN` | Opcional | Sentry → Project Settings |
| `UPSTASH_REDIS_REST_URL` | Opcional | Upstash Console |
| `UPSTASH_REDIS_REST_TOKEN` | Opcional | Upstash Console |

> ⚠️ Nunca commitar service_role_key do Supabase. Apenas `NEXT_PUBLIC_*` (anon) deve ir para o bundle.

### 1.4 Stripe Webhook

Configurar endpoint em **Stripe Dashboard → Developers → Webhooks**:

- **URL:** `https://<seu-dominio>/api/stripe/webhook`
- **Eventos:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `charge.refunded`
- **Modo:** live (em produção)
- Copiar **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 1.5 Domínio Custom (Vercel)

1. **Vercel → Project → Settings → Domains**
2. Adicionar `energialivre.com.br` e `www.energialivre.com.br`
3. Configurar DNS no registrador (ex: Registro.br):
   - `A @ → 76.76.21.21` (Vercel IP)
   - `CNAME www → cname.vercel-dns.com`
4. Aguardar propagação (até 48h, mas geralmente minutos)
5. SSL é provisionado automaticamente pela Vercel

**Monitorar propagação:**

```powershell
# Rápido
nslookup energialivre.com.br 8.8.8.8

# Detalhado
powershell -ExecutionPolicy Bypass -File scripts\check-dns.ps1 -TimeoutMinutes 130
```

---

## 2. Pós-Deploy (validação)

### 2.1 Smoke Tests

```bash
# Health check
curl https://energialivre.com.br/api/health

# Páginas públicas
curl -I https://energialivre.com.br/
curl -I https://energialivre.com.br/economizar
curl -I https://energialivre.com.br/vender
```

### 2.2 Teste end-to-end do checkout

1. Criar conta de teste (consumidor)
2. Acessar `/checkout`
3. Clicar em "Assinar Agora" no plano Básico
4. Preencher com cartão de teste Stripe (`4242 4242 4242 4242`)
5. Confirmar que webhook foi recebido em **Stripe Dashboard → Webhooks → Logs**
6. Confirmar que assinatura foi criada em `assinaturas` com `tipo_plano='consumidor'`
7. Repetir com conta tipo `gerador` e plano Pro

### 2.3 Logs estruturados

Verificar em Vercel:
- `/api/stripe/webhook` deve mostrar `200` (não 500/400)
- `/api/admin/stats` deve retornar JSON (auth ok)
- `/api/health` deve mostrar `status: healthy`

---

## 3. Monitoramento Contínuo

### 3.1 Endpoints chave

| Endpoint | Esperado |
|----------|----------|
| `GET /api/health` | `200` + `{status: "healthy"}` |
| `GET /api/admin/stats` | `200` (autenticado) ou `401` |
| `POST /api/stripe/webhook` | `200` com signature válida, `400` com signature inválida |

### 3.2 Alertas sugeridos (Vercel + Sentry)

- `5xx > 1%` em 5min → alerta
- Latência P95 > 3s em `/api/*` → alerta
- Webhook Stripe falhou 3x seguidas → alerta crítica

### 3.3 Quando configurar Sentry

1. `npm install @sentry/nextjs`
2. `npx @sentry/wizard@latest -i nextjs`
3. Adicionar `SENTRY_DSN` e `NEXT_PUBLIC_SENTRY_DSN` no `.env.local` e na Vercel
4. Os arquivos `sentry.{client,server,edge}.config.ts` já estão prontos e carregam automaticamente

### 3.4 Quando configurar Upstash (Rate Limiting)

1. Criar database em https://console.upstash.com
2. Adicionar `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` no `.env.local` e na Vercel
3. `npm install @upstash/ratelimit @upstash/redis`
4. O arquivo `lib/ratelimit.ts` já está pronto e faz fallback in-memory se Upstash não estiver configurado

**Uso em uma API route:**

```ts
import { rateLimit, RATE_LIMIT_PRESETS, getClientIp } from '@/lib/ratelimit'

const ip = getClientIp(req.headers)
const { success, remaining } = await rateLimit({
  identifier: ip,
  ...RATE_LIMIT_PRESETS.lead,
})
if (!success) {
  return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })
}
```

---

## 4. Troubleshooting

### Bug: "Webhook signature verification failed"

Causa: `STRIPE_WEBHOOK_SECRET` incorreto ou signature ausente.
Solução: copiar signing secret exato do endpoint no Stripe Dashboard.

### Bug: Assinatura criada mas tipo_plano = 'consumidor' (sempre)

Causa: migration `20260105_assinatura_tipo_plano.sql` não aplicada.
Solução: aplicar a migration. Re-executar webhook em Stripe Dashboard → Webhooks → Resend.

### Bug: "relation admins does not exist" em match/locations

Causa: migration `20260105_create_admins_table.sql` não aplicada.
Solução: aplicar a migration. Limpar cache do Supabase (Dashboard → Settings → API → Reload schema).

### Bug: Usuário admin não consegue acessar `/admin/*`

Causa: ele não está em `admins` (mesmo com `role='admin'` em `profiles`).
Solução: o trigger `sync_admins_from_profiles` resolve automaticamente. Se urgente:
```sql
INSERT INTO admins (id, email, nome)
SELECT id, email, nome FROM profiles WHERE role = 'admin'
ON CONFLICT (id) DO NOTHING;
```

### Bug: Páginas com água/vazias (CSS não carregou)

Causa: `NEXT_PUBLIC_SITE_URL` errado, ou `metadataBase` quebrou.
Solução: verificar env var e redeploy.

### DNS: domínio não resolve

```powershell
Resolve-DnsName energialivre.com.br -Type NS
Resolve-DnsName energialivre.com.br -Type A
# Se vier SOA-only, ainda não propagou (pode levar até 48h)
```

Online: https://dnschecker.org/#NS/energialivre.com.br

---

## 5. Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Testes
npm test
npm run test:watch
npm run test:coverage

# Lint + tipos + build
npm run lint
npx tsc --noEmit
npm run build

# Gerar types do Supabase (se tiver CLI)
npx supabase gen types typescript --project-id eahwyotzbskfjvsoqzw > lib/database.types.ts
```

---

## 6. Contatos & Recursos

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Supabase Dashboard:** https://supabase.com/dashboard/project/eahwyotzbskfjvsoqzw
- **Vercel Dashboard:** https://vercel.com/dashboard
- **DNS do domínio:** Registro.br (ou onde foi registrado)
- **Logs Stripe:** Stripe Dashboard → Developers → Webhooks → Logs
- **Logs Vercel:** Vercel Dashboard → Project → Logs
