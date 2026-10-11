/** WCAG 2.x contrast helpers. Shared by the contrast check script, tests and /design-system. */

export type RGBA = { r: number; g: number; b: number; a: number }

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb()/rgba() in comma or space syntax. */
export function parseColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase()
  const hex = s.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    let h = hex[1]!
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    if (h.length !== 6 && h.length !== 8) return null
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16)
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 }
  }
  const fn = s.match(/^rgba?\((.+)\)$/)
  if (fn) {
    const parts = fn[1]!.split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 3) return null
    const ch = (v: string) => (v.endsWith('%') ? (parseFloat(v) / 100) * 255 : parseFloat(v))
    const alpha = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])
    return { r: ch(parts[0]!), g: ch(parts[1]!), b: ch(parts[2]!), a: alpha }
  }
  return null
}

const channel = (c: number) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance({ r, g, b }: RGBA): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Composite a translucent colour over an opaque background. */
export function flatten(fg: RGBA, bg: RGBA): RGBA {
  const a = fg.a
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 }
}

export function contrastRatio(fg: RGBA, bg: RGBA): number {
  const top = fg.a < 1 ? flatten(fg, bg) : fg
  const l1 = relativeLuminance(top)
  const l2 = relativeLuminance(bg)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

export type WcagLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail'

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}
