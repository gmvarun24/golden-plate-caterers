import type { MetadataRoute } from 'next'

import { getBrand } from '@/lib/brand/get-brand'

// Pick up Brand Settings changes from /admin without a redeploy.
export const revalidate = 3600

/** Web app manifest: makes the site installable ("Add to Home Screen" / "Install app"). */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const brand = await getBrand()
  return {
    id: '/',
    name: brand.name,
    short_name: brand.shortName,
    description: `${brand.name}: premium event catering. Browse menus, build a package and send an enquiry.`,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    // Mirrors --color-bg in the dark theme, the same tile the icons sit on.
    background_color: '#16120e',
    theme_color: '#16120e',
    lang: 'en-IN',
    categories: ['food', 'lifestyle', 'business'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/brand/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'Menus & packages', short_name: 'Menus', url: '/menus' },
      { name: 'Contact us', short_name: 'Contact', url: '/contact' },
    ],
  }
}
