import type { Metadata } from 'next'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { PackageCard } from '@/components/catalog/PackageCard'
import { Customiser } from '@/components/customiser/Customiser'
import { Gallery } from '@/components/package/Gallery'
import { PackageViewTracker } from '@/components/package/PackageViewTracker'
import { JsonLd } from '@/components/seo/JsonLd'
import { RichText } from '@/components/package/RichText'
import { Badge, DietTag } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { ArrowRightIcon, ChevronRightIcon, WhatsAppIcon } from '@/components/ui/icons'
import { Price } from '@/components/ui/Price'
import { getBrand } from '@/lib/brand/get-brand'
import { whatsappHref } from '@/lib/contact'
import { getEventTypes, getPackage, getPackageCards, getPackageSlugs } from '@/lib/data/catalog'
import { getSiteContent } from '@/lib/data/site'
import { serverEnv } from '@/lib/env'
import { formatINR, formatINRNumber } from '@/lib/format/currency'
import { breadcrumbJsonLd, packageJsonLd } from '@/lib/seo/jsonld'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPackageSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = await getPackage((await params).slug)
  if (!pkg) return {}
  return {
    title: pkg.seo.title ?? `${pkg.title} — from ${formatINR(pkg.priceFrom)} per plate`,
    description: pkg.seo.description ?? pkg.shortDescription,
    alternates: { canonical: `/menus/${pkg.slug}` },
  }
}

export default async function PackagePage({ params }: Props) {
  const { slug } = await params
  const [pkg, brand, site, all, events] = await Promise.all([
    getPackage(slug),
    getBrand(),
    getSiteContent(),
    getPackageCards(),
    getEventTypes(),
  ])
  if (!pkg) notFound()
  const siteUrl = serverEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

  const related = all
    .filter((p) => p.slug !== pkg.slug && p.eventTypes.some((e) => pkg.eventTypes.some((x) => x.slug === e.slug)))
    .slice(0, 3)
  const wa = whatsappHref(brand.contact.whatsapp, `Hi ${brand.name}, I'm interested in the "${pkg.title}" menu.`)

  return (
    <article data-sticky-bar className="pb-(--spacing-section)">
      <PackageViewTracker slug={pkg.slug} />
      <JsonLd
        data={[
          packageJsonLd(pkg, siteUrl),
          breadcrumbJsonLd(siteUrl, [
            { name: 'Menus', path: '/menus' },
            { name: pkg.title, path: `/menus/${pkg.slug}` },
          ]),
        ]}
      />
      <div className="container-wide pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-text-muted">
            <li>
              <NextLink href="/menus" className="hover:text-accent">
                Menus
              </NextLink>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="size-3.5" />
            </li>
            <li aria-current="page" className="truncate text-text">
              {pkg.title}
            </li>
          </ol>
        </nav>
      </div>

      <div className="container-wide grid gap-10 pt-6 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <Gallery images={pkg.gallery} title={pkg.title} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="flex flex-wrap gap-2">
            <DietTag diet={pkg.diet} />
            {pkg.cuisines.map((c) => (
              <Badge key={c.slug} variant="outline">
                {c.name}
              </Badge>
            ))}
          </div>
          <h1 className="text-5xl leading-tight tracking-display">{pkg.title}</h1>
          <p className="text-lg text-text-muted">{pkg.shortDescription}</p>
          <p className="text-sm text-text-muted">
            Perfect for {pkg.eventTypes.map((e) => e.name.replace(/\s*\(.*\)$/, '')).join(', ')} ·{' '}
            {formatINRNumber(pkg.minGuests)}–{formatINRNumber(pkg.maxGuests)} guests
          </p>

          <div className="rounded-md border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <Price amount={pkg.priceFrom} per="plate" prefix="from" size="lg" />
            </div>
            <table className="mt-5 w-full text-sm">
              <caption className="sr-only">Price per plate by number of guests</caption>
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th scope="col" className="py-2 font-normal">
                    Guests
                  </th>
                  <th scope="col" className="py-2 text-right font-normal">
                    Per plate
                  </th>
                </tr>
              </thead>
              <tbody>
                {pkg.tiers.map((t) => (
                  <tr key={t.minGuests} className="border-b border-border last:border-0">
                    <td className="py-2.5 tabular">
                      {formatINRNumber(t.minGuests)}–{formatINRNumber(t.maxGuests)}
                    </td>
                    <td className="py-2.5 text-right font-medium tabular">{formatINR(t.pricePerPlate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-text-muted">{site.pricingDisclaimer}</p>
            <div className="mt-5 flex flex-col gap-3">
              <a href="#customise" className={buttonVariants({ size: 'lg' })} data-cursor="customise">
                Customise this menu <ArrowRightIcon />
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" data-analytics="whatsapp_click" className={buttonVariants({ variant: 'leaf' })}>
                <WhatsAppIcon /> Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {pkg.description && (
        <div className="container-wide pt-(--spacing-section)">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 className="eyebrow text-accent lg:col-span-3">About this menu</h2>
            <RichText data={pkg.description} className="lg:col-span-9" />
          </div>
        </div>
      )}

      <section id="customise" aria-labelledby="customise-title" className="container-wide scroll-mt-20 pt-(--spacing-section)">
        <div className="mb-10 flex max-w-2xl flex-col gap-3">
          <p className="eyebrow text-accent">Customise</p>
          <h2 id="customise-title" className="text-5xl leading-tight tracking-display">
            Make it <em className="text-accent-display italic">yours</em>
          </h2>
          <p className="text-lg text-text-muted">
            Choose dishes within each section and add any extras. Your estimate updates as you go, and your choices are
            saved on this device.
          </p>
        </div>
        <Customiser pkg={pkg} occasions={events.map((e) => ({ slug: e.slug, name: e.name }))} disclaimer={site.pricingDisclaimer} />
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="container-wide pt-(--spacing-section)">
          <h2 id="related-title" className="mb-8 text-4xl">
            You may also like
          </h2>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <PackageCard pkg={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
