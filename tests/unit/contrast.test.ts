import { describe, expect, it } from 'vitest'

import { checkContrast } from '../../scripts/check-contrast'
import { contrastRatio, parseColor, wcagLevel } from '@/lib/color/contrast'

describe('contrast helpers', () => {
  it('computes known ratios', () => {
    const black = parseColor('#000')!
    const white = parseColor('#ffffff')!
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5)
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5)
  })

  it('parses rgb() in both syntaxes', () => {
    expect(parseColor('rgb(30 25 19 / 0.5)')).toEqual({ r: 30, g: 25, b: 19, a: 0.5 })
    expect(parseColor('rgba(30, 25, 19, 1)')).toEqual({ r: 30, g: 25, b: 19, a: 1 })
  })

  it('classifies WCAG levels', () => {
    expect(wcagLevel(7.2)).toBe('AAA')
    expect(wcagLevel(4.6)).toBe('AA')
    expect(wcagLevel(3.2)).toBe('AA Large')
    expect(wcagLevel(2)).toBe('Fail')
  })
})

describe('design tokens meet WCAG AA', () => {
  const results = checkContrast()

  it('checks both themes', () => {
    expect(results.some((r) => r.theme === 'light')).toBe(true)
    expect(results.some((r) => r.theme === 'dark')).toBe(true)
  })

  it.each(results.map((r) => [`${r.theme}: ${r.fg} on ${r.bg}`, r] as const))('%s', (_label, r) => {
    expect(r.ratio, `${r.ratio.toFixed(2)} < ${r.min}`).toBeGreaterThanOrEqual(r.min)
  })
})
