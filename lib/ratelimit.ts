// ============================================
// RATE LIMITER (UPSTASH REDIS) - COM FALLBACK
// ============================================
// Fornece uma API única de rate limiting que funciona com
// Upstash Redis em produção e com fallback in-memory em dev
// (ou quando as variáveis UPSTASH_* não estão definidas).
//
// Para ativar o Redis em produção:
//   1. Criar database no https://console.upstash.com
//   2. Adicionar ao .env.local e nas envs da Vercel:
//        UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
//        UPSTASH_REDIS_REST_TOKEN=xxx
//   3. npm install @upstash/ratelimit @upstash/redis
// ============================================

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  limit: number
}

interface RateLimitOptions {
  /** Identificador único do cliente (IP, userId, etc) */
  identifier: string
  /** Limite de requisições na janela */
  limit: number
  /** Janela em segundos */
  window: number
}

const memoryStore = new Map<string, { count: number; resetAt: number }>()

async function memoryRateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now()
  const key = `${opts.identifier}`
  const entry = memoryStore.get(key)

  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + opts.window * 1000 })
    return { success: true, remaining: opts.limit - 1, reset: opts.window, limit: opts.limit }
  }

  entry.count += 1
  const remaining = Math.max(0, opts.limit - entry.count)
  return {
    success: entry.count <= opts.limit,
    remaining,
    reset: Math.ceil((entry.resetAt - now) / 1000),
    limit: opts.limit,
  }
}

async function upstashRateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  // Pacotes opcionais - carregados apenas se UPSTASH_* estiver configurado
  // Usamos webpackIgnore para que o Next não tente resolver no build
  /* @ts-ignore - pacote opcional, ignorado pelo webpack */
  const importUpstash: () => Promise<any> = (() => {
    const fn = new Function('return import("@upstash/ratelimit")')
    return () => fn()
  })()
  const importRedis: () => Promise<any> = (() => {
    const fn = new Function('return import("@upstash/redis")')
    return () => fn()
  })()
  const ratelimitMod = await importUpstash().catch(() => null)
  const redisMod = await importRedis().catch(() => null)
  if (!ratelimitMod || !redisMod) throw new Error('Upstash packages not installed')
  const { Ratelimit } = ratelimitMod as any
  const { Redis } = redisMod as any
  if (!Ratelimit || !Redis) throw new Error('Upstash packages not properly loaded')

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.limit, `${opts.window} s`),
    analytics: true,
    prefix: 'energia-livre:rl',
  })

  const result = await limiter.limit(opts.identifier)
  return {
    success: result.success,
    remaining: result.remaining,
    reset: Math.ceil((result.reset - Date.now()) / 1000),
    limit: result.limit,
  }
}

export async function rateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const useUpstash = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )
  try {
    if (useUpstash) {
      return await upstashRateLimit(opts)
    }
  } catch (err) {
    // Cai no fallback abaixo
    console.warn('[ratelimit] Upstash falhou, usando fallback em memória:', err)
  }
  return memoryRateLimit(opts)
}

// ============================================
// PRESETS
// ============================================

export const RATE_LIMIT_PRESETS = {
  /** APIs públicas gerais: 60 req / minuto por IP */
  api: { limit: 60, window: 60 },
  /** Webhook Stripe: 100 req / minuto (margem) */
  webhook: { limit: 100, window: 60 },
  /** Auth: 10 tentativas / minuto por IP */
  auth: { limit: 10, window: 60 },
  /** Checkout: 5 tentativas / minuto por userId */
  checkout: { limit: 5, window: 60 },
  /** Lead capture: 3 envios / 5 min por IP */
  lead: { limit: 3, window: 300 },
} as const

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
