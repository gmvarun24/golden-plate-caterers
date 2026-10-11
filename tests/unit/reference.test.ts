import { describe, expect, it } from 'vitest'

import { formatReference, generateToken, parseQuoteSlug, periodFor, quoteSlug, tokensMatch, TOKEN_LENGTH } from '@/lib/enquiry/reference'

describe('reference IDs', () => {
  it('formats PREFIX-MMYY-NNNN', () => {
    expect(formatReference('GPC', '1026', 42)).toBe('GPC-1026-0042')
    expect(formatReference('GPC', '0127', 12345)).toBe('GPC-0127-12345')
  })

  it('uses India time for the month', () => {
    // 31 Oct 2026, 20:00 UTC = 1 Nov 2026, 01:30 IST
    expect(periodFor(new Date('2026-10-31T20:00:00Z'))).toBe('1126')
    expect(periodFor(new Date('2026-10-31T18:00:00Z'))).toBe('1026')
  })

  it('generates unambiguous tokens', () => {
    const tokens = new Set(Array.from({ length: 500 }, () => generateToken()))
    expect(tokens.size).toBeGreaterThan(495)
    for (const t of tokens) expect(t).toMatch(new RegExp(`^[a-hjkmnp-z2-9]{${TOKEN_LENGTH}}$`))
  })

  it('round-trips quote slugs and rejects junk', () => {
    expect(parseQuoteSlug(quoteSlug('GPC-1026-0042', 'k3f9xq'))).toEqual({ referenceId: 'GPC-1026-0042', token: 'k3f9xq' })
    expect(parseQuoteSlug('gpc-1026-0042-K3F9XQ')).toEqual({ referenceId: 'GPC-1026-0042', token: 'k3f9xq' })
    expect(parseQuoteSlug('GPC-1026-0042')).toBeNull()
    expect(parseQuoteSlug('GPC-1026-0042-k3f9x0')).toBeNull() // "0" not in alphabet
    expect(parseQuoteSlug('../../etc-passwd')).toBeNull()
    expect(parseQuoteSlug('%E0%A4%A')).toBeNull()
  })

  it('compares tokens safely', () => {
    expect(tokensMatch('k3f9xq', 'k3f9xq')).toBe(true)
    expect(tokensMatch('k3f9xq', 'k3f9xr')).toBe(false)
    expect(tokensMatch('k3f9xq', 'k3f9x')).toBe(false)
  })
})
