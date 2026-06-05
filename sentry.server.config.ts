// ============================================
// SENTRY - SERVER (NODE) CONFIGURATION
// ============================================
// Carregado automaticamente pelo Next.js quando
// SENTRY_DSN está definido.
//
// Veja sentry.client.config.ts para instruções de ativação.
// ============================================

void (async () => {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return
  try {
    // @ts-ignore - pacote opcional, instalado apenas em produção
    const mod = await import('@sentry/nextjs')
    const Sentry = (mod as any).default ?? mod
    Sentry.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    })
  } catch {
    // @sentry/nextjs não instalado - silencioso
  }
})()

