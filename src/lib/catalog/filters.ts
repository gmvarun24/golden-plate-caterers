/**
 * /menus filters ⇄ URL. Pure functions (unit tested) so the server page and the client filter
 * bar agree exactly. URL shape:
 *   /menus?occasion=wedding&cuisine=kerala,andhra&diet=veg&min=400&max=1200&guests=300&sort=price-asc
 */
import { pricePerPlateFor } from '../pricing/tiers'
import type { PublicPackageCard } from '../data/types'

export const DIET_FILTERS = ['veg', 'non-veg', 'jain'] as const
export type DietFilter = (typeof DIET_FILTERS)[number]

export const SORTS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
] as const
export type Sort = (typeof SORTS)[number]['value']

export type MenuFilters = {
  occasion: string | null
  cuisines: string[]
  diets: DietFilter[]
  min: number | null
  max: number | null
  guests: number | null
  sort: Sort
}

export const EMPTY_FILTERS: MenuFilters = { occasion: null, cuisines: [], diets: [], min: null, max: null, guests: null, sort: 'popular' }

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v.join(',') : (v ?? ''))
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[a-z0-9-]{1,60}$/.test(s))
const int = (v: string | string[] | undefined, lo: number, hi: number) => {
  const n = Number.parseInt(first(v) ?? '', 10)
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null
}

/** Parse untrusted search params; anything invalid is dropped. */
export function parseFilters(params: RawParams): MenuFilters {
  const occasion = list(params.occasion)[0] ?? null
  const sortRaw = first(params.sort)
  let min = int(params.min, 0, 100_000)
  let max = int(params.max, 0, 100_000)
  if (min !== null && max !== null && min > max) [min, max] = [max, min]
  return {
    occasion,
    // Sorted so equivalent URLs produce identical filters (and cache keys).
    cuisines: [...new Set(list(params.cuisine))].sort(),
    diets: [...new Set(list(params.diet))].filter((d): d is DietFilter => (DIET_FILTERS as readonly string[]).includes(d)).sort(),
    min,
    max,
    guests: int(params.guests, 1, 100_000),
    sort: SORTS.some((s) => s.value === sortRaw) ? (sortRaw as Sort) : 'popular',
  }
}

/** Serialise to a stable query string (empty values omitted). */
export function toQueryString(f: MenuFilters): string {
  const q = new URLSearchParams()
  if (f.occasion) q.set('occasion', f.occasion)
  if (f.cuisines.length) q.set('cuisine', [...f.cuisines].sort().join(','))
  if (f.diets.length) q.set('diet', [...f.diets].sort().join(','))
  if (f.min !== null) q.set('min', String(f.min))
  if (f.max !== null) q.set('max', String(f.max))
  if (f.guests !== null) q.set('guests', String(f.guests))
  if (f.sort !== 'popular') q.set('sort', f.sort)
  return q.toString()
}

export const activeFilterCount = (f: MenuFilters) =>
  Number(Boolean(f.occasion)) + f.cuisines.length + f.diets.length + Number(f.min !== null || f.max !== null) + Number(f.guests !== null)

/**
 * Diet matching: "Veg" shows pure-veg kitchens (veg + Jain); "Jain" shows Jain only;
 * "Non-veg" shows non-veg and mixed menus.
 */
const DIET_MATCH: Record<DietFilter, PublicPackageCard['diet'][]> = {
  veg: ['veg', 'jain'],
  jain: ['jain'],
  'non-veg': ['non-veg', 'mixed'],
}

/** The per-plate price used for budget filtering and sorting. */
export function effectivePrice(p: PublicPackageCard, guests: number | null): number {
  return (guests ? pricePerPlateFor(p.tiers, guests) : null) ?? p.priceFrom
}

export function applyFilters(cards: PublicPackageCard[], f: MenuFilters): PublicPackageCard[] {
  const filtered = cards.filter((p) => {
    if (f.occasion && !p.eventTypes.some((e) => e.slug === f.occasion)) return false
    if (f.cuisines.length && !p.cuisines.some((c) => f.cuisines.includes(c.slug))) return false
    if (f.diets.length && !f.diets.some((d) => DIET_MATCH[d].includes(p.diet))) return false
    if (f.guests !== null && (f.guests < p.minGuests || f.guests > p.maxGuests)) return false
    if (f.min !== null || f.max !== null) {
      // With a guest count: the exact price. Without: any overlap with the package's range.
      const lo = f.guests ? effectivePrice(p, f.guests) : p.priceFrom
      const hi = f.guests ? lo : p.priceTo
      if (f.min !== null && hi < f.min) return false
      if (f.max !== null && lo > f.max) return false
    }
    return true
  })
  const price = (p: PublicPackageCard) => effectivePrice(p, f.guests)
  switch (f.sort) {
    case 'price-asc':
      return filtered.sort((a, b) => price(a) - price(b))
    case 'price-desc':
      return filtered.sort((a, b) => price(b) - price(a))
    default:
      return filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || b.popularity - a.popularity)
  }
}

/** Slider bounds rounded outward to ₹50. */
export function priceBounds(cards: PublicPackageCard[]): { min: number; max: number } {
  if (cards.length === 0) return { min: 0, max: 2000 }
  const lo = Math.min(...cards.map((c) => c.priceFrom))
  const hi = Math.max(...cards.map((c) => c.priceTo))
  return { min: Math.floor(lo / 50) * 50, max: Math.ceil(hi / 50) * 50 }
}
