/** Pure helpers over a package's guest-count price tiers. Shared by client and server. */
export type Tier = { minGuests: number; maxGuests: number; pricePerPlate: number }

/** The tier that applies to `guests`, or null if outside every tier. */
export function tierFor(tiers: readonly Tier[], guests: number): Tier | null {
  return tiers.find((t) => guests >= t.minGuests && guests <= t.maxGuests) ?? null
}

/** Per-plate price for `guests`, or null if the count is outside the package range. */
export function pricePerPlateFor(tiers: readonly Tier[], guests: number): number | null {
  return tierFor(tiers, guests)?.pricePerPlate ?? null
}

/** Lowest and highest per-plate price across tiers ("from ₹450"). */
export function priceRange(tiers: readonly Tier[]): { from: number; to: number } {
  if (tiers.length === 0) return { from: 0, to: 0 }
  const prices = tiers.map((t) => t.pricePerPlate)
  return { from: Math.min(...prices), to: Math.max(...prices) }
}

/** Tiers sorted by guest count (admin order is not guaranteed). */
export function sortedTiers(tiers: readonly Tier[]): Tier[] {
  return [...tiers].sort((a, b) => a.minGuests - b.minGuests)
}
