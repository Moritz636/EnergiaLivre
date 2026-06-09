/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self)' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
];

const cacheHeaders = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.energialivre.dev.br' },
    ],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/ssr', 'recharts'],
    scrollRestoration: true,
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/embaixador', headers: cacheHeaders },
      { source: '/regulamentacao', headers: cacheHeaders },
      { source: '/simulador', headers: cacheHeaders },
      { source: '/para-geradores', headers: cacheHeaders },
      { source: '/token', headers: cacheHeaders },
      { source: '/termos', headers: cacheHeaders },
      { source: '/manifesto', headers: cacheHeaders },
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/_next/static/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/api/health', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ]
  },
  async redirects() {
    return [
      { source: '/parceiros', destination: '/embaixador', permanent: true },
      { source: '/dashboard-parceiro', destination: '/embaixador/dashboard', permanent: true },
      { source: '/cadastro-parceiro', destination: '/cadastro-embaixador', permanent: true },
      { source: '/dashboard/chat', destination: '/dashboard/match', permanent: true },
      { source: '/dashboard/chat/:id*', destination: '/dashboard/match', permanent: true },
    ]
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
};

module.exports = nextConfig;
