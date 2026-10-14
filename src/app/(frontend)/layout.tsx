import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ServiceWorker } from '@/components/pwa/ServiceWorker'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from '@/components/ui/Toaster'
import { getBrand } from '@/lib/brand/get-brand'
import { fontVariables } from '@/styles/fonts'
import '@/styles/globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: `${brand.name} — ${brand.tagline}`, template: `%s · ${brand.shortName}` },
    description: `${brand.name}: premium event catering. Weddings, receptions, house-warmings, birthdays and corporate events.`,
    applicationName: brand.name,
    icons: {
      icon: [{ url: brand.logo.favicon, type: 'image/svg+xml' }],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    },
    // Launch full-screen from the iOS home screen, like the manifest's `display: standalone`.
    appleWebApp: { capable: true, title: brand.shortName, statusBarStyle: 'default' },
  }
}

export const viewport: Viewport = {
  // Matches --color-bg in each theme (browser chrome on mobile).
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f3ea' },
    { media: '(prefers-color-scheme: dark)', color: '#16120e' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Before first paint: enable entrance animations only if motion is welcome. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ready')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only-focusable fixed top-3 left-3 z-(--z-transition) rounded-full bg-accent-fill px-5 py-3 font-medium text-on-accent"
          >
            Skip to content
          </a>
          {children}
          <Toaster />
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  )
}
