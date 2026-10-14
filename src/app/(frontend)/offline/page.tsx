import type { Metadata } from 'next'

import { LogoMark } from '@/components/brand/Logo'
import { buttonVariants } from '@/components/ui/Button'
import { PhoneIcon } from '@/components/ui/icons'
import { getBrand } from '@/lib/brand/get-brand'
import { telHref } from '@/lib/contact'

export const metadata: Metadata = { title: 'Offline', robots: { index: false, follow: false } }

/** Served by the service worker (public/sw.js) when a page is requested with no connection. */
export default async function OfflinePage() {
  const brand = await getBrand()
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-(--spacing-gutter) text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <LogoMark className="size-20" />
        <p className="eyebrow text-text-muted">You&rsquo;re offline</p>
        <h1 className="text-4xl">The kitchen line is down.</h1>
        <p className="text-text-muted">
          We couldn&rsquo;t reach the internet. Check your connection and try again, or give us a call; phone
          lines still work.
        </p>
        <a href={telHref(brand.contact.phone)} data-analytics="call_click" className={buttonVariants()}>
          <PhoneIcon />
          Call {brand.contact.phone}
        </a>
      </div>
    </main>
  )
}
