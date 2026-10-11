import type { ArrayField } from 'payload'

export type PriceTier = { minGuests: number; maxGuests: number; pricePerPlate: number }

/**
 * Tiers must be sorted, non-overlapping and contiguous (each tier starts one guest after the
 * previous one ends), so every guest count between the package min and max has exactly one price.
 * Returns an error message, or null if valid. Pure — unit tested.
 */
export function validatePriceTiers(
  tiers: Partial<PriceTier>[] | null | undefined,
  packageMin?: number | null,
  packageMax?: number | null,
): string | null {
  if (!tiers || tiers.length === 0) return 'Add at least one price tier.'
  for (const [i, t] of tiers.entries()) {
    if (t.minGuests == null || t.maxGuests == null || t.pricePerPlate == null) return `Tier ${i + 1} is incomplete.`
    if (t.minGuests > t.maxGuests) return `Tier ${i + 1}: minimum guests is above maximum.`
    if (t.pricePerPlate <= 0) return `Tier ${i + 1}: price must be above zero.`
  }
  const sorted = [...tiers].sort((a, b) => a.minGuests! - b.minGuests!)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!
    const cur = sorted[i]!
    if (cur.minGuests! <= prev.maxGuests!) return `Tiers overlap around ${cur.minGuests} guests.`
    if (cur.minGuests! !== prev.maxGuests! + 1) return `Gap between ${prev.maxGuests} and ${cur.minGuests} guests.`
  }
  if (packageMin != null && sorted[0]!.minGuests !== packageMin)
    return `The first tier must start at the package minimum (${packageMin} guests).`
  if (packageMax != null && sorted.at(-1)!.maxGuests !== packageMax)
    return `The last tier must end at the package maximum (${packageMax} guests).`
  return null
}

export const priceTiersField: ArrayField = {
  name: 'priceTiers',
  type: 'array',
  required: true,
  minRows: 1,
  labels: { singular: 'Price tier', plural: 'Price tiers' },
  admin: {
    description: 'Per-plate price by guest count. Tiers must cover min → max guests without gaps.',
    initCollapsed: false,
  },
  validate: (value, { siblingData }) => {
    const data = siblingData as { minGuests?: number; maxGuests?: number }
    return validatePriceTiers(value as Partial<PriceTier>[], data.minGuests, data.maxGuests) ?? true
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'minGuests', type: 'number', required: true, min: 1 },
        { name: 'maxGuests', type: 'number', required: true, min: 1 },
        { name: 'pricePerPlate', label: 'Price / plate (₹)', type: 'number', required: true, min: 1 },
      ],
    },
  ],
}
