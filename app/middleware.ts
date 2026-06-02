import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rotas que NÃO precisam de login (Lei 16: Ausência aumenta o valor)
// Cada rota protegida parece mais exclusiva
const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/cadastro',
  '/admin-login',
  '/parceiros',
  '/cadastro-parceiro',
  '/simulador',
  '/api/(.*)',
  '/(.*).jpg',
  '/(.*).jpeg',
  '/(.*).png',
  '/(.*).gif',
  '/(.*).svg',
  '/(.*).ico',
  '/(.*).webp',
  '/favicon.ico',
])

export default clerkMiddleware(async (auth, request) => {
  // Se não é rota pública E não está autenticado → bloqueia
  if (!isPublicRoute(request)) {
    const { userId } = await auth()
    
    if (!userId) {
      // Lei 6: Chame atenção - redirecione com urgência
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    // Ignora arquivos estáticos e Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}