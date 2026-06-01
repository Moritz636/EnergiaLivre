import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAILS = ['energialivreofc@gmail.com']

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    let response = NextResponse.next()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return request.cookies.get(name)?.value }, set(name: string, value: string, options: any) { response.cookies.set({ name, value, ...options }) }, remove(name: string, options: any) { response.cookies.set({ name, value: '', ...options }) } } }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.redirect(new URL('/admin-login', request.url))
    if (!ADMIN_EMAILS.includes(session.user.email || '')) return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: '/admin/:path*' }