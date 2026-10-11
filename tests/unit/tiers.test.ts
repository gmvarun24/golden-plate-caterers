import { describe, expect, it } from 'vitest'

import { priceRange, pricePerPlateFor, sortedTiers, tierFor } from '@/lib/pricing/tiers'

const tiers = [
  { minGuests: 300, maxGuests: 600, pricePerPlate: 450 },
  { minGuests: 50, maxGuests: 149, pricePerPlate: 520 },
  { minGuests: 150, maxGuests: 299, pricePerPlate: 480 },
]

describe('tier helpers', () => {
  it('finds the tier at the boundaries', () => {
    expect(pricePerPlateFor(tiers, 50)).toBe(520)
    expect(pricePerPlateFor(tiers, 149)).toBe(520)
    expect(pricePerPlateFor(tiers, 150)).toBe(480)
    expect(pricePerPlateFor(tiers, 600)).toBe(450)
  })

  it('returns null outside the range', () => {
    expect(tierFor(tiers, 49)).toBeNull()
    expect(pricePerPlateFor(tiers, 601)).toBeNull()
  })

  it('computes the price range', () => {
    expect(priceRange(tiers)).toEqual({ from: 450, to: 520 })
    expect(priceRange([])).toEqual({ from: 0, to: 0 })
  })

  it('sorts tiers by guest count', () => {
    expect(sortedTiers(tiers).map((t) => t.minGuests)).toEqual([50, 150, 300])
  })
})
