/**
 * The frozen quote: a self-contained copy of the menu, add-ons and every price line at the moment
 * of submission. Later menu or price edits never change it. Contains no vendor or cost data.
 */
import type { PublicPackage } from '../data/types'
import { calculateQuote, type QuoteLine, type Selection } from '../pricing/calculate'

export type QuoteSnapshotV1 = {
  version: 1
  computedAt: string
  package: { slug: string; title: string; diet: PublicPackage['diet']; cuisines: string[] }
  guests: number
  tier: { minGuests: number; maxGuests: number; pricePerPlate: number }
  sections: { title: string; items: { name: string; diet: string; isPremium: boolean; surchargePerPlate: number }[] }[]
  addOns: { name: string; pricingType: 'per_plate' | 'flat'; unitPrice: number; amount: number }[]
  lines: QuoteLine[]
  perPlateTotal: number
  flatTotal: number
  total: number
  currency: 'INR'
  disclaimer: string
}

export type SnapshotResult = { ok: true; snapshot: QuoteSnapshotV1 } | { ok: false; reason: string }

/** Recomputes the quote from server-side package data and freezes it. */
export function buildSnapshot(pkg: PublicPackage, selection: Selection, disclaimer: string, now = new Date()): SnapshotResult {
  const quote = calculateQuote(pkg, selection)
  if (!quote.valid || !quote.tier) {
    const reason = quote.guestIssue ?? quote.issues[0]?.message ?? (quote.unknownIds.length ? 'Some dishes are no longer available.' : 'Invalid selection')
    return { ok: false, reason }
  }
  const sections = pkg.sections.map((s) => {
    const chosen = new Set(selection.items[s.id] ?? [])
    return {
      title: s.title,
      items: s.items
        .filter((i) => chosen.has(i.id))
        .map((i) => ({ name: i.name, diet: i.diet, isPremium: i.isPremium, surchargePerPlate: i.surchargePerPlate })),
    }
  })
  const chosenAddOns = new Set(selection.addOnIds)
  const addOns = pkg.addOns
    .filter((a) => chosenAddOns.has(a.id))
    .map((a) => ({
      name: a.name,
      pricingType: a.pricingType,
      unitPrice: a.price,
      amount: a.pricingType === 'per_plate' ? a.price * quote.guests : a.price,
    }))
  return {
    ok: true,
    snapshot: {
      version: 1,
      computedAt: now.toISOString(),
      package: { slug: pkg.slug, title: pkg.title, diet: pkg.diet, cuisines: pkg.cuisines.map((c) => c.name) },
      guests: quote.guests,
      tier: quote.tier,
      sections,
      addOns,
      lines: quote.lines,
      perPlateTotal: quote.perPlate.total,
      flatTotal: quote.flatTotal,
      total: quote.total,
      currency: 'INR',
      disclaimer,
    },
  }
}

/** Narrowing guard for snapshots read back from the JSON column. */
export function isSnapshotV1(v: unknown): v is QuoteSnapshotV1 {
  return typeof v === 'object' && v !== null && (v as { version?: unknown }).version === 1 && Array.isArray((v as { lines?: unknown }).lines)
}
