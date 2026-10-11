import type { ReactNode } from 'react'

import { MobileContactBar } from '@/components/layout/MobileContactBar'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { LazyEnhancements } from '@/components/motion/LazyEnhancements'
import { JsonLd } from '@/components/seo/JsonLd'
import { getBrand } from '@/lib/brand/get-brand'
import { getCuisines, getPackageCards } from '@/lib/data/catalog'
import { serverEnv } from '@/lib/env'
import { formatINR } from '@/lib/format/currency'
import { businessJsonLd } from '@/lib/seo/jsonld'

/** Public site chrome: header, footer and the floating contact actions on phones. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [brand, cuisines, cards] = await Promise.all([getBrand(), getCuisines(), getPackageCards()])
  const prices = cards.flatMap((c) => [c.priceFrom, c.priceTo])
  const priceRange = prices.length ? `${formatINR(Math.min(...prices))}–${formatINR(Math.max(...prices))} per plate` : undefined
  return (
    <>
      <JsonLd data={businessJsonLd(brand, serverEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''), cuisines, priceRange)} />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <MobileContactBar />
      <LazyEnhancements />
    </>
  )
}
