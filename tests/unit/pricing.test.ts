import { describe, expect, it } from 'vitest'

import { calculateQuote, defaultSelection, sectionIssue, type PricingPackage } from '@/lib/pricing/calculate'

const pkg: PricingPackage & { sections: (PricingPackage['sections'][number] & { items: { defaultSelected?: boolean }[] })[] } = {
  title: 'Sadya',
  minGuests: 50,
  maxGuests: 600,
  tiers: [
    { minGuests: 50, maxGuests: 149, pricePerPlate: 520 },
    { minGuests: 150, maxGuests: 299, pricePerPlate: 480 },
    { minGuests: 300, maxGuests: 600, pricePerPlate: 450 },
  ],
  sections: [
    {
      id: 'starters',
      title: 'Starters',
      min: 2,
      max: 2,
      items: [
        { id: 'vada', name: 'Maddur Vada', isPremium: false, surchargePerPlate: 0, defaultSelected: true },
        { id: 'bonda', name: 'Mysore Bonda', isPremium: false, surchargePerPlate: 0 },
        { id: 'dahi', name: 'Dahi Kebab', isPremium: true, surchargePerPlate: 35, defaultSelected: true },
      ],
    },
    {
      id: 'desserts',
      title: 'Desserts',
      min: 1,
      max: 2,
      items: [
        { id: 'payasam', name: 'Payasam', isPremium: false, surchargePerPlate: 0, defaultSelected: true },
        { id: 'halwa', name: 'Badam Halwa', isPremium: true, surchargePerPlate: 40, defaultSelected: true },
        { id: 'pak', name: 'Mysore Pak', isPremium: false, surchargePerPlate: 0, defaultSelected: true },
      ],
    },
  ],
  addOns: [
    { id: 'dosa', name: 'Live dosa counter', pricingType: 'per_plate', price: 60 },
    { id: 'staff', name: 'Service staff', pricingType: 'flat', price: 9000 },
  ],
}

describe('calculateQuote', () => {
  it('computes base × guests with the right tier', () => {
    const q = calculateQuote(pkg, { guests: 200, items: { starters: ['vada', 'bonda'], desserts: ['payasam'] }, addOnIds: [] })
    expect(q.valid).toBe(true)
    expect(q.tier?.pricePerPlate).toBe(480)
    expect(q.total).toBe(480 * 200)
    expect(q.perPlate).toEqual({ base: 480, premium: 0, addOns: 0, total: 480 })
  })

  it('adds premium surcharges and per-plate add-ons per guest, flat add-ons once', () => {
    const q = calculateQuote(pkg, {
      guests: 300,
      items: { starters: ['vada', 'dahi'], desserts: ['halwa', 'payasam'] },
      addOnIds: ['dosa', 'staff'],
    })
    expect(q.perPlate).toEqual({ base: 450, premium: 75, addOns: 60, total: 585 })
    expect(q.flatTotal).toBe(9000)
    expect(q.total).toBe(585 * 300 + 9000)
    expect(q.lines.map((l) => l.kind)).toEqual(['base', 'premium', 'premium', 'addon_per_plate', 'addon_flat'])
    expect(q.lines.reduce((s, l) => s + l.amount, 0)).toBe(q.total)
  })

  it('uses tier boundaries exactly', () => {
    const sel = { items: { starters: ['vada', 'bonda'], desserts: ['payasam'] }, addOnIds: [] }
    expect(calculateQuote(pkg, { ...sel, guests: 149 }).tier?.pricePerPlate).toBe(520)
    expect(calculateQuote(pkg, { ...sel, guests: 150 }).tier?.pricePerPlate).toBe(480)
    expect(calculateQuote(pkg, { ...sel, guests: 600 }).tier?.pricePerPlate).toBe(450)
  })

  it('flags guest counts outside the package range but still estimates', () => {
    const sel = { items: { starters: ['vada', 'bonda'], desserts: ['payasam'] }, addOnIds: [] }
    const low = calculateQuote(pkg, { ...sel, guests: 20 })
    expect(low.valid).toBe(false)
    expect(low.guestIssue).toMatch(/50–600/)
    expect(low.perPlate.base).toBe(520)
    expect(calculateQuote(pkg, { ...sel, guests: 900 }).perPlate.base).toBe(450)
  })

  it('enforces section min/max rules', () => {
    const q = calculateQuote(pkg, { guests: 100, items: { starters: ['vada'], desserts: ['payasam', 'halwa', 'pak'] }, addOnIds: [] })
    expect(q.valid).toBe(false)
    expect(q.issues.map((i) => [i.sectionId, i.message])).toEqual([
      ['starters', 'Choose 1 more dish'],
      ['desserts', 'Remove 1 dish'],
    ])
  })

  it('rejects unknown and duplicate ids (never trusts the client)', () => {
    const q = calculateQuote(pkg, {
      guests: 100,
      items: { starters: ['vada', 'vada', 'bonda'], desserts: ['payasam', 'free-lobster'], ghost: ['x'] },
      addOnIds: ['dosa', 'dosa', 'helicopter'],
    })
    expect(q.unknownIds.sort()).toEqual(['free-lobster', 'ghost', 'helicopter'])
    expect(q.valid).toBe(false)
    // Duplicates are counted once
    expect(q.lines.filter((l) => l.label === 'Live dosa counter')).toHaveLength(1)
  })
})

describe('defaultSelection', () => {
  it('pre-selects defaults trimmed to each section max', () => {
    expect(defaultSelection(pkg)).toEqual({ guests: 50, items: { starters: ['vada', 'dahi'], desserts: ['payasam', 'halwa'] }, addOnIds: [] })
  })
})

describe('sectionIssue', () => {
  it('pluralises', () => {
    expect(sectionIssue(0, 3, 3)).toBe('Choose 3 more dishes')
    expect(sectionIssue(5, 1, 3)).toBe('Remove 2 dishes')
    expect(sectionIssue(2, 1, 3)).toBeNull()
  })
})
