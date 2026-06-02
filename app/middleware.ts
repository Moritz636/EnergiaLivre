import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/cadastro',
  '/admin-login',
  '/parceiros',
  '/cadastro-parceiro',
  '/api/(.*)',
  '/(.*).jpg',
  '/(.*).png',
  '/(.*).svg',
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request) && !auth().userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}