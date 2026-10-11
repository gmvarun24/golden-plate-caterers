import { describe, expect, it } from 'vitest'

import { enquirySchema, todayInIndia } from '@/lib/validation/enquiry'
import { formatIndianMobile, maskPhone, normalizeIndianMobile } from '@/lib/validation/phone'

describe('Indian mobile numbers', () => {
  it.each([
    ['98765 43210', '+919876543210'],
    ['+91 98765-43210', '+919876543210'],
    ['09876543210', '+919876543210'],
    ['919876543210', '+919876543210'],
    ['0091 98765 43210', '+919876543210'],
    ['(987) 654-3210', '+919876543210'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeIndianMobile(input)).toBe(expected)
  })

  it.each(['12345 67890', '98765', '+1 415 555 0100', 'abcdefghij', '5876543210'])('rejects %s', (input) => {
    expect(normalizeIndianMobile(input)).toBeNull()
  })

  it('formats and masks', () => {
    expect(formatIndianMobile('+919876543210')).toBe('+91 98765 43210')
    expect(maskPhone('+919876543210')).toBe('+91 ••••• •3210')
  })
})

describe('enquirySchema', () => {
  const valid = {
    name: 'Ananya Rao',
    phone: '98765 43210',
    email: '',
    eventDate: todayInIndia(),
    area: 'Jayanagar',
    guests: '250',
    notes: '',
    consent: true,
  }

  it('accepts a valid enquiry and coerces guests', () => {
    const r = enquirySchema.safeParse(valid)
    expect(r.success).toBe(true)
    expect(r.success && r.data.guests).toBe(250)
  })

  it.each([
    ['name', { name: 'A' }],
    ['phone', { phone: '12345' }],
    ['email', { email: 'not-an-email' }],
    ['eventDate', { eventDate: '2020-01-01' }],
    ['area', { area: '' }],
    ['guests', { guests: '3' }],
    ['consent', { consent: false }],
  ])('rejects bad %s', (field, patch) => {
    const r = enquirySchema.safeParse({ ...valid, ...patch })
    expect(r.success).toBe(false)
    expect(!r.success && r.error.issues[0]?.path[0]).toBe(field)
  })
})
