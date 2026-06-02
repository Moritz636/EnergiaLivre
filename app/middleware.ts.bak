import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rotas públicas
  const publicRoutes = ['/', '/cadastro', '/parceiros', '/cadastro-parceiro']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route)

  // Se não está logado e tenta acessar rota protegida
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se está logado e tenta acessar login/cadastro, redireciona
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/cadastro')) {
    // Verificar se é admin
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single()

    if (adminCheck) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Verificar tipo no profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo')
      .eq('id', user.id)
      .single()

    if (profile?.tipo === 'gerador') {
      return NextResponse.redirect(new URL('/dashboard-gerador', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard-consumidor', request.url))
  }

  // Proteção de rotas admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    // Verificar se é admin
    const { data: isAdmin } = await supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single()

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard-consumidor', request.url))
    }
  }

  // Proteção de dashboards
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/cadastro'],
}