// lib/csrf.ts
// CSRF protection for API routes using Origin/Referer validation

import { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'https://energialivre.dev.br',
  'http://localhost:3000',
].filter(Boolean) as string[]

export function validateCsrf(request: NextRequest | Request): { valid: boolean; reason?: string } {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true }
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  if (!origin && !referer) {
    return { valid: true }
  }

  if (origin) {
    try {
      const originUrl = new URL(origin)
      const matches = ALLOWED_ORIGINS.some(allowed => {
        try {
          const allowedUrl = new URL(allowed)
          return originUrl.origin === allowedUrl.origin
        } catch {
          return false
        }
      })
      if (!matches) {
        return { valid: false, reason: `Origin not allowed: ${origin}` }
      }
      return { valid: true }
    } catch {
      return { valid: false, reason: 'Invalid origin header' }
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer)
      return {
        valid: ALLOWED_ORIGINS.some(allowed => {
          try {
            return new URL(allowed).origin === refererUrl.origin
          } catch {
            return false
          }
        }),
        reason: 'Referer not allowed',
      }
    } catch {
      return { valid: false, reason: 'Invalid referer header' }
    }
  }

  return { valid: true }
}
