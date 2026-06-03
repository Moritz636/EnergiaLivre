import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

// Rotas públicas (Lei 16: Ausência aumenta o valor)
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

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar se a rota é pública
  const { pathname } = new URL(request.url)
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('(.*)')) {
      const regex = new RegExp(route.replace('(.*)', '.*'))
      return regex.test(pathname)
    }
    return pathname === route
  })

  // Se não for rota pública, verificar autenticação
  if (!isPublicRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Redirecionar para login com URL de redirecionamento
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Verificar acesso admin (Lei 1: Controle absoluto)
    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile?.role || profile.role !== 'admin') {
        return NextResponse.redirect('/')
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}