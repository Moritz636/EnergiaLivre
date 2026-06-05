// ============================================
// VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
// ============================================
// Falha rápido se alguma variável obrigatória estiver faltando
// em produção. Em dev, apenas avisa.
// ============================================

type EnvSchema = {
  name: string
  required: boolean
  productionOnly?: boolean
}

const SCHEMA: EnvSchema[] = [
  // Supabase
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true },

  // Stripe
  { name: 'STRIPE_SECRET_KEY', required: true },
  { name: 'STRIPE_WEBHOOK_SECRET', required: true },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', required: false },

  // Admin
  { name: 'ADMIN_EMAIL', required: false },

  // URL pública
  { name: 'NEXT_PUBLIC_SITE_URL', required: false, productionOnly: true },

  // Sentry (opcional)
  { name: 'NEXT_PUBLIC_SENTRY_DSN', required: false },
  { name: 'SENTRY_DSN', required: false },

  // Upstash (opcional)
  { name: 'UPSTASH_REDIS_REST_URL', required: false },
  { name: 'UPSTASH_REDIS_REST_TOKEN', required: false },
]

let _checked = false
let _errors: string[] = []

export function checkEnv(): { ok: boolean; errors: string[]; warnings: string[] } {
  if (_checked) return { ok: _errors.length === 0, errors: _errors, warnings: [] }
  _checked = true

  const isProd = process.env.NODE_ENV === 'production'
  const errors: string[] = []
  const warnings: string[] = []

  for (const item of SCHEMA) {
    const value = process.env[item.name]
    const isEmpty = value === undefined || value === ''

    if (item.required && isEmpty) {
      errors.push(`Variável obrigatória faltando: ${item.name}`)
    } else if (item.productionOnly && isEmpty && isProd) {
      errors.push(`Variável obrigatória em produção: ${item.name}`)
    } else if (isEmpty) {
      warnings.push(`Variável opcional não definida: ${item.name}`)
    }
  }

  _errors = errors
  if (errors.length > 0 && isProd) {
    console.error('[env] ERROS:', errors)
  }
  if (warnings.length > 0) {
    console.warn('[env] Avisos:', warnings)
  }

  return { ok: errors.length === 0, errors, warnings }
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
