import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) { response.cookies.set({ name, value, ...options }) },
        remove(name: string, value: string, options: any) { response.cookies.set({ name, value, ...options }) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Proteção de Rotas Admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/admin-login', request.url))
    
    const { data: profile } = await supabase.from('profiles').select('tipo').eq('id', user.id).single();
    if (profile?.tipo !== 'admin') return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Proteção de Dashboards
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/dashboard-consumidor', '/dashboard-gerador'],
}
