import { describe, expect, it } from 'vitest'

import type { PublicPackage } from '@/lib/data/types'
import { buildSnapshot, isSnapshotV1 } from '@/lib/enquiry/snapshot'

const item = (id: string, name: string, extra: Partial<PublicPackage['sections'][number]['items'][number]> = {}) => ({
  id, dishId: id, name, description: '', diet: 'veg' as const, spiceLevel: 0 as const, isPremium: false, surchargePerPlate: 0, defaultSelected: false, image: null, ...extra,
})

const pkg: PublicPackage = {
  slug: 'sadya', title: 'Sadya', diet: 'veg', shortDescription: '', cuisines: [{ slug: 'udupi', name: 'Udupi' }], eventTypes: [],
  image: null, minGuests: 50, maxGuests: 300, tiers: [{ minGuests: 50, maxGuests: 300, pricePerPlate: 500 }], priceFrom: 500, priceTo: 500,
  featured: false, popularity: 0, description: null, gallery: [], seo: { title: null, description: null, image: null },
  sections: [{ id: 's1', title: 'Desserts', description: '', min: 1, max: 2, items: [item('a', 'Payasam'), item('b', 'Halwa', { isPremium: true, surchargePerPlate: 40 })] }],
  addOns: [{ id: 'x', name: 'Staff', description: '', pricingType: 'flat', price: 9000, category: 'service-staff', image: null }],
}

describe('buildSnapshot', () => {
  it('freezes menu, add-ons and price lines from server data', () => {
    const r = buildSnapshot(pkg, { guests: 100, items: { s1: ['a', 'b'] }, addOnIds: ['x'] }, 'Indicative.', new Date('2026-10-11T00:00:00Z'))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.snapshot.total).toBe(500 * 100 + 40 * 100 + 9000)
    expect(r.snapshot.sections[0]!.items.map((i) => i.name)).toEqual(['Payasam', 'Halwa'])
    expect(r.snapshot.addOns).toEqual([{ name: 'Staff', pricingType: 'flat', unitPrice: 9000, amount: 9000 }])
    expect(r.snapshot.computedAt).toBe('2026-10-11T00:00:00.000Z')
    expect(isSnapshotV1(JSON.parse(JSON.stringify(r.snapshot)))).toBe(true)
    // Never leaks internal fields
    expect(JSON.stringify(r.snapshot)).not.toMatch(/vendor|cost/i)
  })

  it('refuses invalid selections', () => {
    expect(buildSnapshot(pkg, { guests: 10, items: { s1: ['a'] }, addOnIds: [] }, '').ok).toBe(false)
    expect(buildSnapshot(pkg, { guests: 100, items: { s1: [] }, addOnIds: [] }, '').ok).toBe(false)
    expect(buildSnapshot(pkg, { guests: 100, items: { s1: ['a'] }, addOnIds: ['nope'] }, '').ok).toBe(false)
  })
})
