import type { MetadataRoute } from 'next'

import { serverEnv } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const base = serverEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/q/', '/design-system'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
