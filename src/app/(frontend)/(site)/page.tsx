import type { Metadata } from 'next'
import NextLink from 'next/link'

import { OccasionCard } from '@/components/catalog/OccasionCard'
import { PackageCard } from '@/components/catalog/PackageCard'
import { ContactCta } from '@/components/home/ContactCta'
import { FaqList } from '@/components/home/FaqList'
import { Hero } from '@/components/home/Hero'
import { HorizontalOccasions } from '@/components/home/HorizontalOccasions'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Marquee } from '@/components/home/Marquee'
import { SectionHeading } from '@/components/home/SectionHeading'
import { Testimonials } from '@/components/home/Testimonials'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { buttonVariants } from '@/components/ui/Button'
import { ArrowRightIcon } from '@/components/ui/icons'
import { getBrand } from '@/lib/brand/get-brand'
import { whatsappHref } from '@/lib/contact'
import { getCuisines, getEventTypes, getFeaturedPackages, getPackageCards } from '@/lib/data/catalog'
import { getSiteContent } from '@/lib/data/site'

export async function generateMetadata(): Promise<Metadata> {
  const [brand, site] = await Promise.all([getBrand(), getSiteContent()])
  return {
    title: { absolute: site.seo.title ?? `${brand.name} — Event Catering` },
    description:
      site.seo.description ??
      `Premium catering for weddings, receptions, Gruhapravesha, birthdays and corporate events. Customise your menu and see an instant estimate.`,
    alternates: { canonical: '/' },
  }
}

export default async function HomePage() {
  const [brand, site, events, featured, cuisines, all] = await Promise.all([
    getBrand(),
    getSiteContent(),
    getEventTypes(),
    getFeaturedPackages(3),
    getCuisines(),
    getPackageCards(),
  ])
  const minPrice = all.length ? Math.min(...all.map((p) => p.priceFrom)) : 0

  return (
    <>
      <Hero
        eyebrow={site.hero.eyebrow}
        headline={site.hero.headline}
        subheadline={site.hero.subheadline}
        image={site.hero.image ?? featured[0]?.image ?? null}
        whatsappHref={whatsappHref(
          brand.contact.whatsapp,
          `Hi ${brand.name}, I'd like to plan catering for an event.`,
        )}
        stats={[
          { value: String(events.length), label: 'Occasions' },
          { value: String(all.length), label: 'Signature menus' },
          { value: minPrice ? `₹${minPrice}` : '—', label: 'From, per plate' },
        ]}
      />

      <section
        aria-labelledby="occasions-title"
        className="overflow-hidden py-(--spacing-section)"
      >
        <div className="container-wide flex flex-col gap-12">
          <SectionHeading
            id="occasions-title"
            eyebrow="Occasions"
            title={
              <>
                For every <em className="text-accent-display italic">milestone</em>
              </>
            }
            lead="Housewarmings at dawn, receptions under lights — menus planned around the moment."
            action={
              <NextLink href="/occasions" className={buttonVariants({ variant: 'secondary' })}>
                All occasions <ArrowRightIcon />
              </NextLink>
            }
          />
        </div>
        {/* Swipeable carousel on phones/tablets; pinned horizontal scroll on desktop. */}
        <HorizontalOccasions>
          <ul
            data-hscroll
            data-cursor="drag"
            className="mt-12 flex snap-x snap-mandatory scroll-px-(--row-inset) [scrollbar-width:thin] gap-4 overflow-x-auto px-(--row-inset) pb-4 [--row-inset:max(var(--spacing-gutter),calc((100vw-var(--container-wide))/2+var(--spacing-gutter)))] md:gap-6"
          >
            {events.map((e, i) => (
              <li
                key={e.slug}
                data-reveal="fade-up"
                style={{ '--i': Math.min(i, 4) } as React.CSSProperties}
                className="w-[72vw] shrink-0 snap-start sm:w-[42vw] lg:w-[clamp(16rem,calc((100svh-18rem)*0.75),24rem)]"
              >
                <OccasionCard event={e} sizes="(min-width: 1024px) 24rem, (min-width: 640px) 42vw, 72vw" />
              </li>
            ))}
          </ul>
        </HorizontalOccasions>
      </section>

      <section aria-labelledby="featured-title" className="bg-bg-subtle py-(--spacing-section)">
        <div className="container-wide flex flex-col gap-12">
          <SectionHeading
            id="featured-title"
            eyebrow="Signature menus"
            title="Most-loved packages"
            lead="Every menu can be customised dish by dish. Prices drop as your guest list grows."
            action={
              <NextLink href="/menus" className={buttonVariants({ variant: 'secondary' })}>
                View all menus <ArrowRightIcon />
              </NextLink>
            }
          />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <li key={p.slug} data-reveal="fade-up" style={{ '--i': i } as React.CSSProperties}>
                <PackageCard pkg={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HowItWorks />

      <WhyChooseUs items={site.whyChooseUs} />

      <Marquee
        items={[
          ...cuisines.map((c) => c.name),
          ...events.slice(0, 5).map((e) => e.name.replace(/\s*\(.*\)$/, '')),
        ]}
      />

      <Testimonials items={site.testimonials} />

      {site.faq.length > 0 && (
        <section aria-labelledby="faq-title" className="pb-(--spacing-section)">
          <div className="container-wide grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading id="faq-title" eyebrow="FAQ" title="Good to know" />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-8">
              <FaqList items={site.faq.slice(0, 5)} />
              <NextLink
                href="/faq"
                className="self-start text-accent underline underline-offset-4 hover:text-accent-hover"
              >
                All questions
              </NextLink>
            </div>
          </div>
        </section>
      )}

      <ContactCta brand={brand} headline={site.finalCta.headline} body={site.finalCta.body} />
    </>
  )
}
