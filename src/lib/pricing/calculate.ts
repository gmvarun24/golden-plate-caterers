/**
 * THE price engine. One pure function, used by the customiser (live estimate) and by the server
 * (which recomputes on submit and never trusts client totals). All amounts are whole rupees.
 */
import type { AddOnPricingType } from '../catalog/constants'
import { tierFor, type Tier } from './tiers'

/** The minimum a package needs for pricing — a subset of the public DTO. */
export type PricingPackage = {
  title: string
  minGuests: number
  maxGuests: number
  tiers: Tier[]
  sections: {
    id: string
    title: string
    min: number
    max: number
    items: { id: string; name: string; isPremium: boolean; surchargePerPlate: number }[]
  }[]
  addOns: { id: string; name: string; pricingType: AddOnPricingType; price: number }[]
}

export type Selection = {
  guests: number
  /** sectionId → chosen item ids */
  items: Record<string, string[]>
  addOnIds: string[]
}

export type QuoteLine = {
  kind: 'base' | 'premium' | 'addon_per_plate' | 'addon_flat'
  label: string
  /** ₹ per plate for per-plate lines; the flat price for flat lines. */
  unitPrice: number
  /** Guests for per-plate lines; 1 for flat lines. */
  quantity: number
  amount: number
}

export type SectionIssue = { sectionId: string; title: string; chosen: number; min: number; max: number; message: string }

export type QuoteResult = {
  /** True when guests and every section rule are satisfied and all ids are known. */
  valid: boolean
  guests: number
  tier: Tier | null
  perPlate: { base: number; premium: number; addOns: number; total: number }
  lines: QuoteLine[]
  flatTotal: number
  total: number
  issues: SectionIssue[]
  guestIssue: string | null
  unknownIds: string[]
}

const dishes = (n: number) => `${n} ${n === 1 ? 'dish' : 'dishes'}`

/** Human message for a section that breaks its rule, or null when it is satisfied. */
export function sectionIssue(chosen: number, min: number, max: number): string | null {
  if (chosen < min) return `Choose ${min - chosen} more ${min - chosen === 1 ? 'dish' : 'dishes'}`
  if (chosen > max) return `Remove ${dishes(chosen - max)}`
  return null
}

export function calculateQuote(pkg: PricingPackage, sel: Selection): QuoteResult {
  const guests = Math.trunc(sel.guests)
  const tier = tierFor(pkg.tiers, guests)
  const guestIssue =
    !Number.isFinite(guests) || guests < pkg.minGuests || guests > pkg.maxGuests
      ? `This menu serves ${pkg.minGuests}–${pkg.maxGuests} guests.`
      : tier
        ? null
        : 'No price is set for this guest count.'

  const lines: QuoteLine[] = []
  const issues: SectionIssue[] = []
  const unknownIds: string[] = []
  // Price per plate uses the tier that applies; if guests are out of range, show the nearest tier.
  const priceTier = tier ?? (guests < pkg.minGuests ? pkg.tiers[0] : pkg.tiers.at(-1)) ?? null
  const basePerPlate = priceTier?.pricePerPlate ?? 0
  const qty = Math.max(0, guests)

  lines.push({ kind: 'base', label: `${pkg.title} (per plate)`, unitPrice: basePerPlate, quantity: qty, amount: basePerPlate * qty })

  let premiumPerPlate = 0
  const knownSections = new Set(pkg.sections.map((s) => s.id))
  for (const sectionId of Object.keys(sel.items)) if (!knownSections.has(sectionId)) unknownIds.push(sectionId)

  for (const section of pkg.sections) {
    const chosenIds = [...new Set(sel.items[section.id] ?? [])]
    const byId = new Map(section.items.map((i) => [i.id, i]))
    const chosen = chosenIds.filter((id) => {
      if (byId.has(id)) return true
      unknownIds.push(id)
      return false
    })
    const message = sectionIssue(chosen.length, section.min, section.max)
    if (message) issues.push({ sectionId: section.id, title: section.title, chosen: chosen.length, min: section.min, max: section.max, message })
    for (const id of chosen) {
      const item = byId.get(id)!
      if (item.isPremium && item.surchargePerPlate > 0) {
        premiumPerPlate += item.surchargePerPlate
        lines.push({
          kind: 'premium',
          label: `${item.name} (premium)`,
          unitPrice: item.surchargePerPlate,
          quantity: qty,
          amount: item.surchargePerPlate * qty,
        })
      }
    }
  }

  let addOnsPerPlate = 0
  let flatTotal = 0
  const addOnById = new Map(pkg.addOns.map((a) => [a.id, a]))
  for (const id of [...new Set(sel.addOnIds)]) {
    const a = addOnById.get(id)
    if (!a) {
      unknownIds.push(id)
      continue
    }
    if (a.pricingType === 'per_plate') {
      addOnsPerPlate += a.price
      lines.push({ kind: 'addon_per_plate', label: a.name, unitPrice: a.price, quantity: qty, amount: a.price * qty })
    } else {
      flatTotal += a.price
      lines.push({ kind: 'addon_flat', label: a.name, unitPrice: a.price, quantity: 1, amount: a.price })
    }
  }

  const perPlateTotal = basePerPlate + premiumPerPlate + addOnsPerPlate
  const total = lines.reduce((sum, l) => sum + l.amount, 0)

  return {
    valid: guestIssue === null && issues.length === 0 && unknownIds.length === 0,
    guests,
    tier,
    perPlate: { base: basePerPlate, premium: premiumPerPlate, addOns: addOnsPerPlate, total: perPlateTotal },
    lines,
    flatTotal,
    total,
    issues,
    guestIssue,
    unknownIds,
  }
}

/** Default selection: pre-selected dishes (trimmed to each section's max) and no add-ons. */
type WithDefaults = { sections: { id: string; max: number; items: { id: string; defaultSelected?: boolean }[] }[]; minGuests: number }

export function defaultSelection(pkg: WithDefaults, guests?: number): Selection {
  const items: Record<string, string[]> = {}
  for (const s of pkg.sections) {
    items[s.id] = s.items
      .filter((i) => i.defaultSelected)
      .slice(0, s.max)
      .map((i) => i.id)
  }
  return { guests: guests ?? pkg.minGuests, items, addOnIds: [] }
}
