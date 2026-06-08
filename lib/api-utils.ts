import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from './ratelimit'
import { validateCsrf } from './csrf'

type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse>

interface ApiOptions {
  rateLimit?: { limit: number; window: number } | false
  csrf?: boolean
}

export function withRateLimit(handler: ApiHandler, opts?: { limit: number; window: number }): ApiHandler {
  return async (req, context) => {
    const identifier = getClientIp(req.headers)
    const result = await rateLimit({
      identifier,
      ...(opts ?? RATE_LIMIT_PRESETS.api),
    })

    const response = await handler(req, context)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Muitas requisicoes. Tente novamente em alguns segundos.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.reset),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.reset),
          },
        },
      )
    }

    response.headers.set('X-RateLimit-Limit', String(result.limit))
    response.headers.set('X-RateLimit-Remaining', String(result.remaining))
    response.headers.set('X-RateLimit-Reset', String(result.reset))

    return response
  }
}

export function withCsrf(handler: ApiHandler): ApiHandler {
  return async (req, context) => {
    const { valid, reason } = validateCsrf(req)
    if (!valid) {
      return NextResponse.json(
        { error: reason || 'CSRF validation failed' },
        { status: 403 },
      )
    }
    return handler(req, context)
  }
}

export function withApiMiddleware(handler: ApiHandler, opts?: ApiOptions): ApiHandler {
  let wrapped = handler
  const csrfEnabled = opts?.csrf ?? true
  if (csrfEnabled) wrapped = withCsrf(wrapped)
  const rateLimitOpts = opts?.rateLimit
  if (rateLimitOpts !== false) wrapped = withRateLimit(wrapped, rateLimitOpts ?? undefined)
  return wrapped
}
