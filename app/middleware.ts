import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/admin-login',
  '/parceiros',
  '/cadastro-parceiro',
  '/cadastro-gerador',
  '/simulador',
  '/economizar',
  '/vender',
  '/regulamentacao',
  '/para-geradores',
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
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
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

  const { pathname } = request.nextUrl
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
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
