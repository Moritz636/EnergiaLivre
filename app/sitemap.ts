import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/env'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, '')
  const now = new Date()
  const publicRoutes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/economizar', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/vender', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/simulador', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/regulamentacao', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/para-geradores', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/embaixador', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/login', changeFrequency: 'yearly', priority: 0.4 },
    { path: '/cadastro', changeFrequency: 'yearly', priority: 0.5 },
  ]
  return publicRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
