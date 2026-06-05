// ============================================
// SENTRY - BROWSER (CLIENT) CONFIGURATION
// ============================================
// Este arquivo é carregado automaticamente pelo Next.js quando
// NEXT_PUBLIC_SENTRY_DSN está definido.
//
// Para ativar:
//   1. npm install @sentry/nextjs
//   2. npx @sentry/wizard@latest -i nextjs
//   3. Definir SENTRY_DSN e NEXT_PUBLIC_SENTRY_DSN no .env
//
// Enquanto @sentry/nextjs não está instalado, este arquivo é um
// no-op (import dinâmico) para não quebrar o build.
// ============================================

void (async () => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return
  try {
    // @ts-ignore - pacote opcional, instalado apenas em produção
    const mod = await import('@sentry/nextjs')
    const Sentry = (mod as any).default ?? mod
    Sentry.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.0,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'NetworkError when attempting to fetch resource',
      ],
    })
  } catch {
    // @sentry/nextjs não instalado - silencioso
  }
})()

