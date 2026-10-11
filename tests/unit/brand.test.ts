import { describe, expect, it } from 'vitest'

import { brandDefaults, brandSchema } from '@/config/brand'
import { mergeBrand } from '@/lib/brand/merge-brand'

describe('brand config', () => {
  it('defaults are valid', () => {
    expect(brandSchema.safeParse(brandDefaults).success).toBe(true)
    expect(brandDefaults.referencePrefix).toBe('GPC')
  })

  it('returns defaults when the global is empty', () => {
    expect(mergeBrand(brandDefaults, null)).toEqual(brandDefaults)
    expect(mergeBrand(brandDefaults, { name: '  ', hours: [] })).toEqual(brandDefaults)
  })

  it('admin values override defaults', () => {
    const b = mergeBrand(brandDefaults, {
      tagline: 'New tagline.',
      phone: '+91 90000 00000',
      whatsapp: '919000000000',
      hours: [{ days: 'Daily', hours: '8 am – 10 pm' }],
    })
    expect(b.tagline).toBe('New tagline.')
    expect(b.contact.whatsapp).toBe('919000000000')
    expect(b.hours).toEqual([{ days: 'Daily', hours: '8 am – 10 pm' }])
    expect(b.name).toBe(brandDefaults.name)
  })

  it('an invalid admin value never breaks the site', () => {
    const b = mergeBrand(brandDefaults, { whatsapp: 'call me' })
    expect(b).toEqual(brandDefaults)
  })
})
