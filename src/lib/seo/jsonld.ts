/**
 * schema.org JSON-LD builders. Business identity comes from Brand Settings only —
 * there is no vendor data anywhere in structured data.
 */
import type { Brand } from '@/config/brand'
import type { PublicCuisine, PublicPackage } from '@/lib/data/types'

type Json = Record<string, unknown>

const DAY: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}
const ORDER = Object.keys(DAY)

function to24h(t: string): string | null {
  const m = t.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (!m) return null
  let h = Number(m[1]) % 12
  if (m[3] === 'pm') h += 12
  return `${String(h).padStart(2, '0')}:${m[2] ?? '00'}`
}

/** "Mon – Sat" + "9:00 am – 8:00 pm" → OpeningHoursSpecification; unparseable rows are skipped. */
export function openingHours(hours: Brand['hours']): Json[] {
  return hours.flatMap(({ days, hours: h }) => {
    const [fromDay, toDay] = days.toLowerCase().split(/[–-]/).map((d) => d.trim().slice(0, 3))
    const [open, close] = h.split(/[–-]/).map(to24h)
    if (!fromDay || !DAY[fromDay] || !open || !close) return []
    const start = ORDER.indexOf(fromDay)
    const end = toDay && DAY[toDay] ? ORDER.indexOf(toDay) : start
    const dayOfWeek = ORDER.slice(start, end + 1).map((d) => DAY[d])
    return [{ '@type': 'OpeningHoursSpecification', dayOfWeek, opens: open, closes: close }]
  })
}

export function businessJsonLd(brand: Brand, siteUrl: string, cuisines: PublicCuisine[], priceRange?: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    '@id': `${siteUrl}/#business`,
    name: brand.name,
    alternateName: brand.shortName,
    slogan: brand.tagline,
    url: siteUrl,
    logo: `${siteUrl}${brand.logo.light}`,
    image: `${siteUrl}/opengraph-image`,
    telephone: brand.contact.phone,
    email: brand.contact.email,
    priceRange,
    servesCuisine: cuisines.map((c) => c.name),
    acceptsReservations: true,
    address: {
      '@type': 'PostalAddress',
      addressLocality: brand.address.locality,
      addressRegion: brand.address.region,
      postalCode: brand.address.postalCode,
      addressCountry: brand.address.country,
    },
    areaServed: { '@type': 'City', name: brand.address.city },
    openingHoursSpecification: openingHours(brand.hours),
    sameAs: brand.socials.map((s) => s.url),
  }
}

export function packageJsonLd(pkg: PublicPackage, siteUrl: string): Json {
  const url = `${siteUrl}/menus/${pkg.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${url}#menu`,
    name: pkg.title,
    description: pkg.shortDescription,
    url,
    inLanguage: 'en-IN',
    provider: { '@id': `${siteUrl}/#business` },
    hasMenuSection: pkg.sections.map((s) => ({
      '@type': 'MenuSection',
      name: s.title,
      hasMenuItem: s.items.map((i) => ({
        '@type': 'MenuItem',
        name: i.name,
        description: i.description || undefined,
        suitableForDiet: i.diet === 'non-veg' ? undefined : 'https://schema.org/VegetarianDiet',
      })),
    })),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: pkg.priceFrom,
      highPrice: pkg.priceTo,
      offerCount: pkg.tiers.length,
      availability: 'https://schema.org/InStock',
      url,
      eligibleQuantity: { '@type': 'QuantitativeValue', minValue: pkg.minGuests, maxValue: pkg.maxGuests, unitText: 'guests' },
      priceSpecification: pkg.tiers.map((t) => ({
        '@type': 'UnitPriceSpecification',
        price: t.pricePerPlate,
        priceCurrency: 'INR',
        unitText: 'per plate',
        eligibleQuantity: { '@type': 'QuantitativeValue', minValue: t.minGuests, maxValue: t.maxGuests, unitText: 'guests' },
      })),
    },
  }
}

export function breadcrumbJsonLd(siteUrl: string, items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${siteUrl}${it.path}` })),
  }
}

export function faqJsonLd(faq: { question: string; answer: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
}
