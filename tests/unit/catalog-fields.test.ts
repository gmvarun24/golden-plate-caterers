import { describe, expect, it } from 'vitest'

import { validatePriceTiers } from '@/fields/price-tiers'
import { slugify } from '@/fields/slug'

describe('validatePriceTiers', () => {
  const ok = [
    { minGuests: 50, maxGuests: 149, pricePerPlate: 520 },
    { minGuests: 150, maxGuests: 299, pricePerPlate: 480 },
    { minGuests: 300, maxGuests: 600, pricePerPlate: 450 },
  ]

  it('accepts contiguous tiers matching the package range', () => {
    expect(validatePriceTiers(ok, 50, 600)).toBeNull()
  })

  it('accepts tiers in any order', () => {
    expect(validatePriceTiers([...ok].reverse(), 50, 600)).toBeNull()
  })

  it('rejects an empty list', () => {
    expect(validatePriceTiers([], 50, 600)).toMatch(/at least one/)
  })

  it('rejects gaps', () => {
    expect(validatePriceTiers([ok[0]!, { ...ok[1]!, minGuests: 160 }, ok[2]!], 50, 600)).toMatch(/Gap/)
  })

  it('rejects overlaps', () => {
    expect(validatePriceTiers([ok[0]!, { ...ok[1]!, minGuests: 140 }, ok[2]!], 50, 600)).toMatch(/overlap/)
  })

  it('rejects tiers that do not span the package min/max', () => {
    expect(validatePriceTiers(ok, 30, 600)).toMatch(/first tier/)
    expect(validatePriceTiers(ok, 50, 800)).toMatch(/last tier/)
  })

  it('rejects inverted ranges and non-positive prices', () => {
    expect(validatePriceTiers([{ minGuests: 100, maxGuests: 50, pricePerPlate: 400 }])).toMatch(/above maximum/)
    expect(validatePriceTiers([{ minGuests: 50, maxGuests: 100, pricePerPlate: 0 }])).toMatch(/above zero/)
  })
})

describe('slugify', () => {
  it.each([
    ['House Warming (Gruhapravesha)', 'house-warming-gruhapravesha'],
    ['Party & Get-together', 'party-and-get-together'],
    ['  Café Crème  ', 'cafe-creme'],
  ])('%s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected)
  })
})
