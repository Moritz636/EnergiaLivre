import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) { 
          response.cookies.set({ name, value, ...options }) 
        },
        remove(name: string, value: string, options: any) { 
          response.cookies.set({ name, value, ...options }) 
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Proteção de rotas Admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Se não estiver logado, manda para login admin
    if (!user) {
      if (request.nextUrl.pathname !== '/admin-login') {
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }
    } else {
      // Se estiver logado, verifica se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', user.id)
        .single()
      
      // Se NÃO for admin, manda para dashboard normal
      if (profile?.tipo !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard-consumidor', request.url))
      }
      
      // Se já estiver no admin-login e for admin, manda para dashboard
      if (request.nextUrl.pathname === '/admin-login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
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
  matcher: ['/admin/:path*', '/admin-login', '/dashboard/:path*', '/dashboard-consumidor', '/dashboard-gerador'],
}