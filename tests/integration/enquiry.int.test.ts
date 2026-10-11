import { describe, expect, it } from 'vitest'

import { checkRateLimit } from '@/lib/enquiry/rate-limit'
import { formatReference, periodFor } from '@/lib/enquiry/reference'
import { nextReferenceId } from '@/lib/enquiry/sequence'

import { seededPayload } from './helpers'

describe('reference ID sequence (atomic)', () => {
  it('never issues duplicates under concurrency', async () => {
    const payload = await seededPayload()
    const ids = await Promise.all(Array.from({ length: 50 }, () => nextReferenceId(payload, 'GPC')))
    expect(new Set(ids).size).toBe(50)
    const period = periodFor(new Date())
    const numbers = ids.map((id) => Number(id.split('-')[2])).sort((a, b) => a - b)
    // Contiguous block of 50
    expect(numbers.at(-1)! - numbers[0]! + 1).toBe(50)
    expect(ids).toContain(formatReference('GPC', period, numbers[0]!))
  })

  it('starts each month at 0001', async () => {
    const payload = await seededPayload()
    const id = await nextReferenceId(payload, 'GPC', new Date('2031-03-15T10:00:00+05:30'))
    expect(id).toBe('GPC-0331-0001')
  })
})

describe('rate limiting', () => {
  it('allows up to the limit then blocks', async () => {
    const payload = await seededPayload()
    const rules = [{ scope: 'test', limit: 3, windowSeconds: 60 }]
    const key = `k-${Date.now()}`
    const results = []
    for (let i = 0; i < 5; i++) results.push(await checkRateLimit(payload, key, rules))
    expect(results).toEqual([true, true, true, false, false])
    // A different client is unaffected
    expect(await checkRateLimit(payload, `${key}-other`, rules)).toBe(true)
  })
})
