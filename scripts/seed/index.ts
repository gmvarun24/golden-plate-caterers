/**
 * Seeds the catalogue with realistic Bengaluru data. Idempotent: re-running updates records in
 * place (matched by slug / code / name), so it is safe to run repeatedly.
 *
 *   npm run seed
 *
 * It never creates users (create the first owner in /admin) and never touches Brand Settings
 * or enquiries.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import type { Media } from '../../src/payload-types'

import { addOns, cuisines, dishes, eventTypes, packages, siteSettings, vendors } from './data'
import { placeholderArt, type ArtPalette } from './placeholder-art'
import {
  PHOTO_SOURCES,
  photoForAddOn,
  photoForDish,
  photoForEvent,
  photosForPackage,
  type PhotoKey,
} from './photo-sources'

type Slugged = { id: number }

/** Create or update a document matched on a unique field. */
async function upsert<T extends Slugged>(
  payload: Payload,
  collection: 'cuisines' | 'event-types' | 'vendors' | 'menu-items' | 'add-ons' | 'packages',
  where: Record<string, string>,
  data: Record<string, unknown>,
): Promise<T> {
  const [field, value] = Object.entries(where)[0]!
  const existing = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    limit: 1,
    depth: 0,
  })
  const doc = existing.docs[0]
  const result = doc
    ? await payload.update({ collection, id: doc.id, data, depth: 0 })
    : await payload.create({ collection, data: data as never, depth: 0 })
  return result as unknown as T
}

/** One media file per alt; reused on re-runs. */
async function mediaFromBuffer(payload: Payload, key: string, alt: string, data: Buffer): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) return existing.docs[0].id
  const doc: Media = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/webp', name: `${key}.webp`, size: data.length },
  })
  return doc.id
}

async function art(payload: Payload, key: string, alt: string, palette: ArtPalette): Promise<number> {
  return mediaFromBuffer(payload, key, alt, await placeholderArt(key, palette))
}

async function photo(payload: Payload, key: string, sourceKey: PhotoKey): Promise<number> {
  const source = PHOTO_SOURCES[sourceKey]
  // Reuse an already-imported copy of this photo (many dishes share one image).
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: source.alt } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) return existing.docs[0].id
  try {
    const res = await fetch(source.url, { headers: { 'User-Agent': 'Golden Plate seed image importer' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const input = Buffer.from(await res.arrayBuffer())
    const data = await sharp(input)
      .rotate()
      .resize(1600, 1100, { fit: 'cover' })
      .webp({ quality: 84 })
      .toBuffer()
    return mediaFromBuffer(payload, key, source.alt, data)
  } catch (err) {
    payload.logger.warn(
      `[seed] Could not fetch real photo "${sourceKey}", using generated fallback: ${String(err)}`,
    )
    return art(payload, key, `${source.alt} fallback illustration`, source.palette)
  }
}

/** Alt texts the seed itself has created in earlier versions (never user uploads). */
const OLD_SEED_ALTS = new Set([
  'Traditional South Indian banana leaf meal',
  'Indian buffet table with many dishes',
  'Indian biryani served with sides',
  'Idli served on banana leaf with chutneys',
  'Close-up of Indian biryani',
  'Masala dosa served with chutneys and sambar',
])
const isSeedAlt = (alt: string) =>
  OLD_SEED_ALTS.has(alt) ||
  /^Overhead view of a festive thali for /.test(alt) ||
  /: (overhead view of the spread|plated detail)$/.test(alt) ||
  / fallback illustration$/.test(alt)

/** Deletes seed-created images that nothing references any more. User uploads are never touched. */
async function removeOrphanedSeedMedia(payload: Payload) {
  const used = new Set<number>()
  const add = (v: unknown) => {
    if (typeof v === 'number') used.add(v)
    else if (v && typeof v === 'object' && 'id' in v && typeof (v as { id: unknown }).id === 'number')
      used.add((v as { id: number }).id)
  }
  const all = async <T>(collection: 'event-types' | 'packages' | 'menu-items' | 'add-ons') =>
    (await payload.find({ collection, limit: 1000, depth: 0, overrideAccess: true })).docs as T[]
  for (const e of await all<{ heroImage?: unknown; seo?: { image?: unknown } }>('event-types'))
    [e.heroImage, e.seo?.image].forEach(add)
  for (const p of await all<{ gallery?: unknown[]; seo?: { image?: unknown } }>('packages'))
    [...(p.gallery ?? []), p.seo?.image].forEach(add)
  for (const m of await all<{ image?: unknown }>('menu-items')) add(m.image)
  for (const a of await all<{ image?: unknown }>('add-ons')) add(a.image)
  const brand = await payload.findGlobal({ slug: 'brand-settings', depth: 0 })
  ;[brand.logoLight, brand.logoDark, brand.logoMono, brand.favicon].forEach(add)
  const site = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  ;[site.seo?.image, site.hero?.image].forEach(add)
  const media = await payload.find({ collection: 'media', limit: 5000, depth: 0, overrideAccess: true })
  for (const m of media.docs) {
    if (!used.has(m.id) && isSeedAlt(m.alt))
      await payload.delete({ collection: 'media', id: m.id, overrideAccess: true })
  }
}

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: [{ type: 'text', version: 1, text, format: 0, style: '', mode: 'normal' as const, detail: 0 }],
})

const richText = (paras: string[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: paras.map(paragraph),
  },
})

/** Seeds (or refreshes) the catalogue. Exported for the integration tests. */
export async function runSeed(payload: Payload) {
  const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

  const cuisineIds = new Map<string, number>()
  for (const [i, c] of cuisines.entries()) {
    const doc = await upsert(payload, 'cuisines', { slug: c.slug }, { ...c, displayOrder: (i + 1) * 10 })
    cuisineIds.set(c.slug, doc.id)
  }
  log(`${cuisines.length} cuisines`)

  const eventIds = new Map<string, number>()
  for (const [i, e] of eventTypes.entries()) {
    const heroImage = await photo(payload, `occasion-${e.slug}`, photoForEvent(e.slug))
    const doc = await upsert(
      payload,
      'event-types',
      { slug: e.slug },
      { ...e, heroImage, displayOrder: (i + 1) * 10 },
    )
    eventIds.set(e.slug, doc.id)
  }
  log(`${eventTypes.length} event types`)

  const vendorIds = new Map<string, number>()
  for (const v of vendors) {
    const doc = await upsert(payload, 'vendors', { code: v.code }, { ...v, active: true })
    vendorIds.set(v.code, doc.id)
  }
  log(`${vendors.length} vendors (internal)`)

  const dishIds = new Map<string, number>()
  for (const d of dishes) {
    const image = await photo(
      payload,
      `dish-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      photoForDish(d.name, d.diet),
    )
    const doc = await upsert(
      payload,
      'menu-items',
      { name: d.name },
      {
        name: d.name,
        description: d.description,
        diet: d.diet,
        spiceLevel: String(d.spice),
        cuisine: cuisineIds.get(d.cuisine),
        image,
        isPremium: Boolean(d.premium),
        surchargePerPlate: d.premium ?? 0,
        defaultSelected: Boolean(d.defaultSelected),
      },
    )
    dishIds.set(d.name, doc.id)
  }
  log(`${dishes.length} dishes`)

  const addOnIds = new Map<string, number>()
  for (const a of addOns) {
    const image = await photo(
      payload,
      `addon-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      photoForAddOn(a.name),
    )
    const doc = await upsert(
      payload,
      'add-ons',
      { name: a.name },
      { ...a, image, isGlobal: Boolean(a.isGlobal), active: true },
    )
    addOnIds.set(a.name, doc.id)
  }
  log(`${addOns.length} add-ons`)

  const need = <T>(map: Map<string, T>, key: string, what: string): T => {
    const v = map.get(key)
    if (v === undefined) throw new Error(`Seed data error: unknown ${what} "${key}"`)
    return v
  }

  for (const p of packages) {
    const packagePhotos = photosForPackage(p.slug)
    const gallery = [
      await photo(payload, `package-${p.slug}-1`, packagePhotos[0]),
      await photo(payload, `package-${p.slug}-2`, packagePhotos[1]),
    ]
    await upsert(
      payload,
      'packages',
      { slug: p.slug },
      {
        title: p.title,
        slug: p.slug,
        diet: p.diet,
        vendor: need(vendorIds, p.vendor, 'vendor'),
        eventTypes: p.eventTypes.map((s) => need(eventIds, s, 'event type')),
        cuisines: p.cuisines.map((s) => need(cuisineIds, s, 'cuisine')),
        shortDescription: p.shortDescription,
        description: richText(p.description),
        gallery,
        minGuests: p.minGuests,
        maxGuests: p.maxGuests,
        priceTiers: p.tiers.map(([minGuests, maxGuests, pricePerPlate]) => ({
          minGuests,
          maxGuests,
          pricePerPlate,
        })),
        costPricePerPlate: p.costPricePerPlate,
        sections: p.sections.map((s) => ({
          title: s.title,
          description: s.description,
          rule: { min: s.min, max: s.max },
          items: s.dishes.map((name) => ({
            menuItem: need(dishIds, name, 'dish'),
            premium: 'inherit',
            defaultSelected: 'inherit',
          })),
        })),
        addOns: p.addOns.map((name) => ({ addOn: need(addOnIds, name, 'add-on') })),
        featured: Boolean(p.featured),
        popularity: p.popularity,
        published: true,
      },
    )
  }
  log(`${packages.length} packages`)

  // Before the orphan cleanup, so the hero photo counts as used.
  const heroImage = await photo(payload, 'home-hero', 'brassThali')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { ...siteSettings, hero: { ...siteSettings.hero, image: heroImage } },
  })
  log('site settings (homepage copy, hero image, FAQ, testimonials)')

  await removeOrphanedSeedMedia(payload)
  log('cleaned up unused seed images')

  log('done ✓')
}

// Run directly: `npm run seed`
if (process.argv[1]?.endsWith('seed/index.ts')) {
  getPayload({ config })
    .then(runSeed)
    .then(() => process.exit(0))
    .catch((err: unknown) => {
      console.error(err)
      process.exit(1)
    })
}
