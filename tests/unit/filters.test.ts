import { describe, expect, it } from 'vitest'

import { applyFilters, parseFilters, priceBounds, toQueryString } from '@/lib/catalog/filters'
import type { PublicPackageCard } from '@/lib/data/types'

const card = (o: Partial<PublicPackageCard> & Pick<PublicPackageCard, 'slug' | 'diet'>): PublicPackageCard => ({
  title: o.slug,
  shortDescription: '',
  cuisines: [],
  eventTypes: [],
  image: null,
  minGuests: 50,
  maxGuests: 500,
  tiers: [
    { minGuests: 50, maxGuests: 199, pricePerPlate: 500 },
    { minGuests: 200, maxGuests: 500, pricePerPlate: 450 },
  ],
  priceFrom: 450,
  priceTo: 500,
  featured: false,
  popularity: 0,
  ...o,
})

const cards = [
  card({ slug: 'veg', diet: 'veg', cuisines: [{ slug: 'udupi', name: 'Udupi' }], eventTypes: [{ slug: 'wedding', name: 'Wedding' }], popularity: 5 }),
  card({ slug: 'jain', diet: 'jain', priceFrom: 560, priceTo: 650, tiers: [{ minGuests: 30, maxGuests: 400, pricePerPlate: 600 }], minGuests: 30, maxGuests: 400, popularity: 9 }),
  card({ slug: 'mixed', diet: 'mixed', priceFrom: 350, priceTo: 420, featured: true, tiers: [{ minGuests: 30, maxGuests: 300, pricePerPlate: 380 }], minGuests: 30, maxGuests: 300 }),
  card({ slug: 'nonveg', diet: 'non-veg', priceFrom: 1320, priceTo: 1500, tiers: [{ minGuests: 150, maxGuests: 1000, pricePerPlate: 1400 }], minGuests: 150, maxGuests: 1000, cuisines: [{ slug: 'kerala', name: 'Kerala' }] }),
]
const slugs = (r: PublicPackageCard[]) => r.map((c) => c.slug)

describe('parseFilters', () => {
  it('parses a full query', () => {
    expect(
      parseFilters({ occasion: 'wedding', cuisine: 'kerala,Andhra,kerala', diet: 'veg,bogus', min: '400', max: '1200', guests: '300', sort: 'price-asc' }),
    ).toEqual({ occasion: 'wedding', cuisines: ['andhra', 'kerala'], diets: ['veg'], min: 400, max: 1200, guests: 300, sort: 'price-asc' })
  })

  it('drops junk and swaps an inverted budget', () => {
    expect(parseFilters({ min: '900', max: '300', guests: '-4', sort: 'evil', cuisine: '<script>' })).toEqual({
      occasion: null, cuisines: [], diets: [], min: 300, max: 900, guests: null, sort: 'popular',
    })
  })

  it('round-trips through the query string', () => {
    const f = parseFilters({ occasion: 'wedding', cuisine: 'udupi,kerala', diet: 'jain', min: '100', guests: '80', sort: 'price-desc' })
    expect(parseFilters(Object.fromEntries(new URLSearchParams(toQueryString(f))))).toEqual(f)
    expect(toQueryString(parseFilters({}))).toBe('')
  })
})

describe('applyFilters', () => {
  const base = parseFilters({})

  it('defaults to featured, then popularity', () => {
    expect(slugs(applyFilters([...cards], base))).toEqual(['mixed', 'jain', 'veg', 'nonveg'])
  })

  it('veg includes Jain; non-veg includes mixed', () => {
    expect(slugs(applyFilters([...cards], { ...base, diets: ['veg'] })).sort()).toEqual(['jain', 'veg'])
    expect(slugs(applyFilters([...cards], { ...base, diets: ['non-veg'] })).sort()).toEqual(['mixed', 'nonveg'])
    expect(slugs(applyFilters([...cards], { ...base, diets: ['jain'] }))).toEqual(['jain'])
  })

  it('filters by occasion and cuisine', () => {
    expect(slugs(applyFilters([...cards], { ...base, occasion: 'wedding' }))).toEqual(['veg'])
    expect(slugs(applyFilters([...cards], { ...base, cuisines: ['kerala', 'udupi'] })).sort()).toEqual(['nonveg', 'veg'])
  })

  it('filters by guest count range', () => {
    expect(slugs(applyFilters([...cards], { ...base, guests: 40 })).sort()).toEqual(['jain', 'mixed'])
    expect(slugs(applyFilters([...cards], { ...base, guests: 800 }))).toEqual(['nonveg'])
  })

  it('filters by budget overlap, or exact price when guests are given', () => {
    expect(slugs(applyFilters([...cards], { ...base, max: 460 })).sort()).toEqual(['mixed', 'veg'])
    // 250 guests → veg costs 450 (inside), mixed 380 (inside), jain 600 (outside)
    expect(slugs(applyFilters([...cards], { ...base, guests: 250, min: 400, max: 500 }))).toEqual(['veg'])
  })

  it('sorts by effective price', () => {
    expect(slugs(applyFilters([...cards], { ...base, sort: 'price-asc' }))).toEqual(['mixed', 'veg', 'jain', 'nonveg'])
    expect(slugs(applyFilters([...cards], { ...base, sort: 'price-desc', guests: 250 }))).toEqual(['nonveg', 'jain', 'veg', 'mixed'])
  })
})

describe('priceBounds', () => {
  it('rounds outward to ₹50', () => {
    expect(priceBounds(cards)).toEqual({ min: 350, max: 1500 })
    expect(priceBounds([])).toEqual({ min: 0, max: 2000 })
  })
})
