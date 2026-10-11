import { describe, expect, it } from 'vitest'

import { readTokenDeclarations } from '../../scripts/lib/resolve-tokens'
import { duration, ease, stagger } from '@/lib/motion/tokens'

const decls = readTokenDeclarations()
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
const ms = (v: string | undefined) => (v?.endsWith('ms') ? parseFloat(v) : v?.endsWith('s') ? parseFloat(v) * 1000 : NaN)

describe('motion tokens: tokens.css ↔ src/lib/motion/tokens.ts', () => {
  it.each(Object.entries(duration))('duration %s', (name, value) => {
    expect(ms(decls.get(`--duration-${name}`))).toBe(value)
  })

  it.each(Object.entries(stagger))('stagger %s', (name, value) => {
    expect(ms(decls.get(`--stagger-${name}`))).toBe(value)
  })

  it.each(Object.entries(ease))('ease %s', (name, points) => {
    expect(decls.get(`--ease-${kebab(name)}`)).toBe(`cubic-bezier(${points.join(', ')})`)
  })
})
