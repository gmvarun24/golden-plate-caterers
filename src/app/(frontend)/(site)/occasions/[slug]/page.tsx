import type { Metadata } from 'next'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/catalog/MediaImage'
import { PackageCard } from '@/components/catalog/PackageCard'
import { ContactCta } from '@/components/home/ContactCta'
import { HowItWorks } from '@/components/home/HowItWorks'
import { SplitText } from '@/components/motion/SplitText'
import { JsonLd } from '@/components/seo/JsonLd'
import { buttonVariants } from '@/components/ui/Button'
import { ArrowRightIcon } from '@/components/ui/icons'
import { getBrand } from '@/lib/brand/get-brand'
import { getEventType, getEventTypes, getPackagesForEvent } from '@/lib/data/catalog'
import { getSiteContent } from '@/lib/data/site'
import { serverEnv } from '@/lib/env'
import { formatINR } from '@/lib/format/currency'
import { breadcrumbJsonLd } from '@/lib/seo/jsonld'

type Props = { params: Promise<{ slug: string }> }

const plainName = (name: string) => name.replace(/\s*\(.*\)$/, '')

export async function generateStaticParams() {
  return (await getEventTypes()).map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventType((await params).slug)
  if (!event) return {}
  return {
    title: event.seo.title ?? `${plainName(event.name)} Catering`,
    description: event.seo.description ?? event.description,
    alternates: { canonical: `/occasions/${event.slug}` },
  }
}

export default async function OccasionPage({ params }: Props) {
  const { slug } = await params
  const [event, packages, brand, site] = await Promise.all([getEventType(slug), getPackagesForEvent(slug), getBrand(), getSiteContent()])
  if (!event) notFound()
  const from = packages.length ? Math.min(...packages.map((p) => p.priceFrom)) : null

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(serverEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''), [
          { name: 'Occasions', path: '/occasions' },
          { name: event.name, path: `/occasions/${event.slug}` },
        ])}
      />
      <section aria-labelledby="occasion-title" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <MediaImage image={event.image} variant="hero" sizes="100vw" priority />
          <div aria-hidden="true" data-theme="dark" className="absolute inset-0 !bg-transparent bg-[linear-gradient(to_top,var(--color-bg)_10%,transparent_75%)]" />
        </div>
        <div data-theme="dark" className="container-wide flex min-h-[60svh] flex-col justify-end gap-5 !bg-transparent pt-32 pb-14 md:min-h-[70svh]">
          <p className="eyebrow text-accent">{event.tagline || 'Occasion'}</p>
          <h1 id="occasion-title" className="max-w-4xl text-display leading-[0.95] tracking-display">
            <SplitText text={`${plainName(event.name)} *catering*`} mode="load" />
          </h1>
          <p className="max-w-2xl text-lg text-text-muted">{event.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            <NextLink href={`/menus?occasion=${event.slug}`} className={buttonVariants({ size: 'lg' })}>
              Compare all menus <ArrowRightIcon />
            </NextLink>
            {from && <span className="text-text-muted">Menus from {formatINR(from)} per plate</span>}
          </div>
        </div>
      </section>

      <section aria-labelledby="occasion-menus" className="py-(--spacing-section)">
        <div className="container-wide flex flex-col gap-10">
          <h2 id="occasion-menus" className="text-5xl leading-tight tracking-display">
            Menus for {plainName(event.name).toLowerCase()}
          </h2>
          {packages.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <li key={p.slug}>
                  <PackageCard pkg={p} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-text-muted">
              We&rsquo;re curating menus for this occasion.{' '}
              <NextLink href="/contact" className="text-accent underline underline-offset-4">
                Tell us what you need
              </NextLink>{' '}
              and we&rsquo;ll plan one with you.
            </p>
          )}
        </div>
      </section>

      <HowItWorks />
      <ContactCta brand={brand} headline={site.finalCta.headline} body={site.finalCta.body} />
    </>
  )
}
