import type { MetadataRoute } from 'next'

import { getEventTypes, getPackageSlugs } from '@/lib/data/catalog'
import { serverEnv } from '@/lib/env'

/** Public, indexable pages only (quotes, admin and the design-system page are excluded). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = serverEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const [slugs, events] = await Promise.all([getPackageSlugs(), getEventTypes()])
  const now = new Date()
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' = 'weekly') => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  })
  return [
    page('/', 1),
    page('/menus', 0.9),
    page('/occasions', 0.8),
    ...events.map((e) => page(`/occasions/${e.slug}`, 0.8)),
    ...slugs.map((s) => page(`/menus/${s}`, 0.8)),
    page('/about', 0.5, 'monthly'),
    page('/contact', 0.6, 'monthly'),
    page('/faq', 0.5, 'monthly'),
    page('/privacy', 0.2, 'monthly'),
    page('/terms', 0.2, 'monthly'),
  ]
}
