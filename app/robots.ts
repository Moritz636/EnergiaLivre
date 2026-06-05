import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard', '/checkout', '/completar-perfil/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
