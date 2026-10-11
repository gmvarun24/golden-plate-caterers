import { describe, expect, it } from 'vitest'

import { getEventTypes, getPackage, getPackageCards } from '@/lib/data/catalog'

import { vendors } from '../../scripts/seed/data'
import { seededPayload } from './helpers'

/** Every identifying vendor string that must never reach the public site. */
const VENDOR_STRINGS: string[] = vendors.flatMap((v) => [v.name, v.code, v.contactPerson, v.phone, v.email])

const leaks = (value: unknown) => {
  const json = JSON.stringify(value)
  return VENDOR_STRINGS.filter((s) => json.includes(s)).concat(/costPrice|"vendor"/.test(json) ? ['vendor/cost field'] : [])
}

describe('roles', () => {
  it('the first account is always an owner', async () => {
    const payload = await seededPayload()
    const first = await payload.find({ collection: 'users', sort: 'createdAt', limit: 1, overrideAccess: true })
    expect(first.docs[0]?.role).toBe('owner')
  })
})

describe('vendor isolation', () => {
  it('public data layer never exposes vendor or cost data', async () => {
    const payload = await seededPayload()
    const cards = await getPackageCards()
    expect(cards.length).toBeGreaterThan(0)
    expect(leaks(cards)).toEqual([])
    for (const c of cards) expect(leaks(await getPackage(c.slug))).toEqual([])
    expect(leaks(await getEventTypes())).toEqual([])
    // sanity: the data really is in the database
    const owner = await payload.find({ collection: 'vendors', overrideAccess: true })
    expect(owner.totalDocs).toBe(vendors.length)
  })

  it('anonymous API access is denied for catalogue, vendors and enquiries', async () => {
    const payload = await seededPayload()
    for (const collection of ['packages', 'vendors', 'enquiries', 'menu-items', 'users'] as const) {
      await expect(payload.find({ collection, overrideAccess: false })).rejects.toThrow()
    }
  })

  it('staff never see vendor identities or cost prices', async () => {
    const payload = await seededPayload()
    const staff = await payload.create({
      collection: 'users',
      data: { email: `staff-${Date.now()}@test.local`, password: 'test-pass-123', name: 'Staff', role: 'staff' },
      overrideAccess: true,
    })
    expect(staff.role).toBe('staff')
    const { docs } = await payload.find({ collection: 'packages', depth: 2, user: staff, overrideAccess: false })
    expect(docs.length).toBeGreaterThan(0)
    expect(leaks(docs)).toEqual([])
    await expect(payload.find({ collection: 'vendors', user: staff, overrideAccess: false })).rejects.toThrow()
  })
})
