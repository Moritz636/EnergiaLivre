import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/ratelimit'
import { validateCsrf } from '@/lib/csrf'

const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/admin-login',
  '/embaixador',
  '/cadastro-embaixador',
  '/cadastro-gerador',
  '/completar-perfil/gerador',
  '/location',
  '/match',
  '/simulador',
  '/economizar',
  '/vender',
  '/regulamentacao',
  '/para-geradores',
  '/checkout',
  '/checkout-member-plus',
  '/api/(.*)',
  '/(.*).(jpg|jpeg|png|gif|svg|ico|webp)',
  '/favicon.ico'
]

// Cache de role em memória (60s TTL)
const roleCache = new Map<string, { role: string; expires: number }>()
const ROLE_CACHE_TTL = 60_000

async function getUserRole(supabase: any, userId: string): Promise<string> {
  const cached = roleCache.get(userId)
  if (cached && cached.expires > Date.now()) {
    return cached.role
  }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const role = data?.role || 'user'
    roleCache.set(userId, { role, expires: Date.now() + ROLE_CACHE_TTL })
    return role
  } catch {
    return 'user'
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── API routes: rate limiting ──
  if (pathname.startsWith('/api/')) {
    let preset: { limit: number; window: number } = RATE_LIMIT_PRESETS.api
    if (pathname.startsWith('/api/stripe/webhook')) {
      preset = RATE_LIMIT_PRESETS.webhook as { limit: number; window: number }
    } else if (pathname.startsWith('/api/auth/')) {
      preset = RATE_LIMIT_PRESETS.auth as { limit: number; window: number }
    }

    const identifier = getClientIp(request.headers)
    const result = await rateLimit({ identifier, ...preset })
    const limitHeaders = {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.reset),
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Muitas requisicoes. Tente novamente em alguns segundos.' },
        {
          status: 429,
          headers: { 'Retry-After': String(result.reset), ...limitHeaders },
        },
      )
    }

    const response = NextResponse.next({ request })
    Object.entries(limitHeaders).forEach(([k, v]) => response.headers.set(k, v))
    return response
  }

  // ── Non-API routes: CSRF + auth ──
  let response = NextResponse.next({ request })

  // CSRF validation for mutating methods (API routes handle their own)
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const { valid, reason } = validateCsrf(request)
    if (!valid) {
      return NextResponse.json(
        { error: reason || 'CSRF validation failed' },
        { status: 403 },
      )
    }
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('(.*)')) {
      const regex = new RegExp(route.replace('(.*)', '.*'))
      return regex.test(pathname)
    }
    return pathname === route
  })

  if (!isPublicRoute) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/admin')) {
      const role = await getUserRole(supabase, user.id)
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Chat interno: exclusivo do programa de embaixadores (tipo=parceiro)
    // ou role=admin. Bloqueia consumidores/geradores.
    if (pathname.startsWith('/dashboard/chat')) {
      const role = await getUserRole(supabase, user.id)
      if (role !== 'admin') {
        // Confere o tipo (parceiro). Cache também guarda em 60s.
        const cached = roleCache.get(`tipo:${user.id}`)
        let tipo: string | null = null
        if (cached && cached.expires > Date.now()) {
          tipo = cached.role
        } else {
          const { data } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', user.id)
            .single()
          tipo = (data as any)?.tipo ?? null
          roleCache.set(`tipo:${user.id}`, {
            role: tipo ?? 'user',
            expires: Date.now() + ROLE_CACHE_TTL,
          })
        }
        if (tipo !== 'parceiro') {
          return NextResponse.redirect(
            new URL(
              tipo === 'gerador'
                ? '/dashboard-gerador'
                : '/dashboard-consumidor',
              request.url,
            ),
          )
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
