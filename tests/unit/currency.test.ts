import { describe, expect, it } from 'vitest'

import { formatINR, formatINRCompact, formatINRNumber, formatPerPlate } from '@/lib/format/currency'

describe('formatINR (en-IN grouping)', () => {
  it.each([
    [0, '₹0'],
    [450, '₹450'],
    [1500, '₹1,500'],
    [150000, '₹1,50,000'],
    [12500000, '₹1,25,00,000'],
  ])('%i → %s', (amount, expected) => {
    expect(formatINR(amount)).toBe(expected)
  })

  it('rounds to whole rupees', () => {
    expect(formatINR(449.6)).toBe('₹450')
  })

  it('formats digits without the symbol', () => {
    expect(formatINRNumber(187500)).toBe('1,87,500')
  })

  it('formats per plate', () => {
    expect(formatPerPlate(650)).toBe('₹650 / plate')
  })
})

describe('formatINRCompact', () => {
  it.each([
    [950, '₹950'],
    [45000, '₹45K'],
    [150000, '₹1.5L'],
    [1875000, '₹18.75L'],
    [22500000, '₹2.25Cr'],
  ])('%i → %s', (amount, expected) => {
    expect(formatINRCompact(amount)).toBe(expected)
  })
})
