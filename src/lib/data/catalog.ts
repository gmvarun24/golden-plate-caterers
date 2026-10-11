import 'server-only'

import config from '@payload-config'
import { cached } from '@/lib/cache'
import { getPayload } from 'payload'

import { CATALOG_TAG } from '@/hooks/revalidate'
import type { AddOn, Cuisine, EventType, Media, MenuItem, Package } from '@/payload-types'

import type {
  PublicAddOn,
  PublicCuisine,
  PublicEventRef,
  PublicEventType,
  PublicImage,
  PublicMenuItem,
  PublicPackage,
  PublicPackageCard,
  PublicSection,
} from './types'
import { priceRange, sortedTiers } from '../pricing/tiers'

/**
 * THE public data layer. Every function here:
 *   - is server-only,
 *   - reads with an explicit `select` whitelist (vendor and cost fields are never loaded),
 *   - maps results to DTOs field by field, so nothing unlisted can reach a page.
 * Pages must never call Payload directly for public data.
 */

const getClient = () => getPayload({ config })

type Rel<T> = number | T | null | undefined
const obj = <T,>(v: Rel<T>): T | null => (v && typeof v === 'object' ? v : null)

/**
 * Payload returns absolute URLs (serverURL + /api/media/file/…). Same-site URLs become relative
 * so next/image treats them as local; external (S3/CDN) URLs are kept as-is.
 */
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
function mediaPath(url: string): string {
  if (SITE_ORIGIN && url.startsWith(SITE_ORIGIN)) return url.slice(SITE_ORIGIN.length) || '/'
  try {
    const u = new URL(url)
    return u.pathname.startsWith('/api/media/file/') ? `${u.pathname}${u.search}` : url
  } catch {
    return url // already relative
  }
}

function toImage(m: Rel<Media>): PublicImage | null {
  const media = obj(m)
  if (!media?.url) return null
  const size = (s: { url?: string | null; width?: number | null; height?: number | null } | undefined) =>
    s?.url && s.width && s.height ? { url: mediaPath(s.url), width: s.width, height: s.height } : undefined
  return {
    url: mediaPath(media.url),
    alt: media.alt,
    width: media.width ?? 1600,
    height: media.height ?? 1100,
    focalX: media.focalX ?? 50,
    focalY: media.focalY ?? 50,
    sizes: {
      thumb: size(media.sizes?.thumb),
      card: size(media.sizes?.card),
      hero: size(media.sizes?.hero),
      og: size(media.sizes?.og),
    },
  }
}

const toCuisine = (c: Cuisine): PublicCuisine => ({ slug: c.slug, name: c.name })
const toEventRef = (e: EventType): PublicEventRef => ({ slug: e.slug, name: e.name })

function toEventType(e: EventType): PublicEventType {
  return {
    slug: e.slug,
    name: e.name,
    tagline: e.tagline ?? '',
    description: e.description ?? '',
    image: toImage(e.heroImage),
    seo: { title: e.seo?.title ?? null, description: e.seo?.description ?? null, image: toImage(e.seo?.image) },
  }
}

function toAddOn(a: AddOn, priceOverride?: number | null): PublicAddOn {
  return {
    id: String(a.id),
    name: a.name,
    description: a.description ?? '',
    pricingType: a.pricingType,
    price: priceOverride ?? a.price,
    category: a.category,
    image: toImage(a.image),
  }
}

type SectionRow = NonNullable<Package['sections']>[number]
type ItemRow = SectionRow['items'][number]

function toMenuItem(row: ItemRow, sectionId: string, index: number): PublicMenuItem | null {
  const dish = obj<MenuItem>(row.menuItem)
  if (!dish) return null
  const isPremium = row.premium === 'premium' ? true : row.premium === 'standard' ? false : Boolean(dish.isPremium)
  const surcharge = isPremium ? (row.surchargePerPlate ?? dish.surchargePerPlate ?? 0) : 0
  const defaultSelected =
    row.defaultSelected === 'yes' ? true : row.defaultSelected === 'no' ? false : Boolean(dish.defaultSelected)
  return {
    // Stable per package+section+row: used as the selection key by the customiser.
    id: row.id ?? `${sectionId}-${index}`,
    dishId: String(dish.id),
    name: dish.name,
    description: dish.description ?? '',
    diet: dish.diet,
    spiceLevel: Number(dish.spiceLevel ?? 0) as 0 | 1 | 2 | 3,
    isPremium,
    surchargePerPlate: surcharge,
    defaultSelected,
    image: toImage(dish.image),
  }
}

function toSection(s: SectionRow, index: number): PublicSection {
  const id = s.id ?? `section-${index}`
  return {
    id,
    title: s.title,
    description: s.description ?? '',
    min: s.rule.min,
    max: s.rule.max,
    items: s.items.map((row, i) => toMenuItem(row, id, i)).filter((x): x is PublicMenuItem => x !== null),
  }
}

function toCard(p: Package): PublicPackageCard {
  const tiers = sortedTiers(
    (p.priceTiers ?? []).map((t) => ({ minGuests: t.minGuests, maxGuests: t.maxGuests, pricePerPlate: t.pricePerPlate })),
  )
  const range = priceRange(tiers)
  const gallery = (p.gallery ?? []).map(toImage).filter((x): x is PublicImage => x !== null)
  return {
    slug: p.slug,
    title: p.title,
    diet: p.diet,
    shortDescription: p.shortDescription,
    cuisines: (p.cuisines ?? []).map((c) => obj(c)).filter((c): c is Cuisine => c !== null).map(toCuisine),
    eventTypes: (p.eventTypes ?? []).map((e) => obj(e)).filter((e): e is EventType => e !== null).map(toEventRef),
    image: gallery[0] ?? null,
    minGuests: p.minGuests,
    maxGuests: p.maxGuests,
    tiers,
    priceFrom: range.from,
    priceTo: range.to,
    featured: Boolean(p.featured),
    popularity: p.popularity ?? 0,
  }
}

/** Fields the public site may load from a package. `vendor` and `costPricePerPlate` are absent. */
const PACKAGE_SELECT = {
  title: true,
  slug: true,
  diet: true,
  eventTypes: true,
  cuisines: true,
  shortDescription: true,
  description: true,
  gallery: true,
  minGuests: true,
  maxGuests: true,
  priceTiers: true,
  sections: true,
  addOns: true,
  featured: true,
  popularity: true,
  seo: true,
} as const

const loadPackages = cached(
  async (): Promise<Package[]> => {
    const payload = await getClient()
    const { docs } = await payload.find({
      collection: 'packages',
      where: { published: { equals: true } },
      select: PACKAGE_SELECT,
      depth: 2,
      limit: 500,
      sort: '-popularity',
      overrideAccess: true,
    })
    return docs as Package[]
  },
  ['public-packages'],
  { tags: [CATALOG_TAG], revalidate: 3600 },
)

const loadGlobalAddOns = cached(
  async (): Promise<AddOn[]> => {
    const payload = await getClient()
    const { docs } = await payload.find({
      collection: 'add-ons',
      where: { and: [{ isGlobal: { equals: true } }, { active: { equals: true } }] },
      depth: 1,
      limit: 100,
      sort: 'category',
      overrideAccess: true,
    })
    return docs
  },
  ['public-global-addons'],
  { tags: [CATALOG_TAG], revalidate: 3600 },
)

const loadEventTypes = cached(
  async (): Promise<EventType[]> => {
    const payload = await getClient()
    const { docs } = await payload.find({ collection: 'event-types', depth: 1, limit: 100, sort: 'displayOrder', overrideAccess: true })
    return docs
  },
  ['public-event-types'],
  { tags: [CATALOG_TAG], revalidate: 3600 },
)

const loadCuisines = cached(
  async (): Promise<Cuisine[]> => {
    const payload = await getClient()
    const { docs } = await payload.find({ collection: 'cuisines', depth: 0, limit: 100, sort: 'displayOrder', overrideAccess: true })
    return docs
  },
  ['public-cuisines'],
  { tags: [CATALOG_TAG], revalidate: 3600 },
)

/** All published packages as cards (featured & most popular first). */
export async function getPackageCards(): Promise<PublicPackageCard[]> {
  const packages = await loadPackages()
  return packages.map(toCard).sort((a, b) => Number(b.featured) - Number(a.featured) || b.popularity - a.popularity)
}

export async function getFeaturedPackages(limit = 3): Promise<PublicPackageCard[]> {
  const cards = await getPackageCards()
  const featured = cards.filter((c) => c.featured)
  return (featured.length ? featured : cards).slice(0, limit)
}

export async function getPackageSlugs(): Promise<string[]> {
  return (await loadPackages()).map((p) => p.slug)
}

/** Full package for the detail page and customiser, or null if missing/unpublished. */
export async function getPackage(slug: string): Promise<PublicPackage | null> {
  const p = (await loadPackages()).find((x) => x.slug === slug)
  if (!p) return null
  const own = (p.addOns ?? [])
    .map((row) => {
      const a = obj<AddOn>(row.addOn)
      return a && a.active !== false ? toAddOn(a, row.priceOverride) : null
    })
    .filter((x): x is PublicAddOn => x !== null)
  const ownIds = new Set(own.map((a) => a.id))
  const global = (await loadGlobalAddOns()).filter((a) => !ownIds.has(String(a.id))).map((a) => toAddOn(a))
  return {
    ...toCard(p),
    description: p.description ?? null,
    gallery: (p.gallery ?? []).map(toImage).filter((x): x is PublicImage => x !== null),
    sections: (p.sections ?? []).map(toSection),
    addOns: [...own, ...global],
    seo: { title: p.seo?.title ?? null, description: p.seo?.description ?? null, image: toImage(p.seo?.image) },
  }
}

export async function getEventTypes(): Promise<PublicEventType[]> {
  return (await loadEventTypes()).map(toEventType)
}

export async function getEventType(slug: string): Promise<PublicEventType | null> {
  const e = (await loadEventTypes()).find((x) => x.slug === slug)
  return e ? toEventType(e) : null
}

export async function getCuisines(): Promise<PublicCuisine[]> {
  return (await loadCuisines()).map(toCuisine)
}

export async function getPackagesForEvent(slug: string): Promise<PublicPackageCard[]> {
  return (await getPackageCards()).filter((p) => p.eventTypes.some((e) => e.slug === slug))
}
