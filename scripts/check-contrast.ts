/**
 * WCAG AA check for every semantic colour pair in both themes.
 *   npm run check:contrast
 * Pairs are declared in src/lib/color/contrast-pairs.ts.
 */
import { CONTRAST_PAIRS } from '../src/lib/color/contrast-pairs'
import { contrastRatio, flatten, parseColor } from '../src/lib/color/contrast'

import { readTokenDeclarations, resolveToken, type Theme } from './lib/resolve-tokens'

export type ContrastResult = { theme: Theme; fg: string; bg: string; ratio: number; min: number; pass: boolean }

export function checkContrast(): ContrastResult[] {
  const decls = readTokenDeclarations()
  const results: ContrastResult[] = []
  for (const theme of ['light', 'dark'] as const) {
    const pageBg = parseColor(resolveToken('--color-bg', theme, decls))
    if (!pageBg) throw new Error('--color-bg must be an opaque colour')
    for (const pair of CONTRAST_PAIRS) {
      const fg = parseColor(resolveToken(`--color-${pair.fg}`, theme, decls))
      const bgRaw = parseColor(resolveToken(`--color-${pair.bg}`, theme, decls))
      if (!fg || !bgRaw) throw new Error(`Cannot parse colours for ${pair.fg} / ${pair.bg} (${theme})`)
      // Translucent backgrounds sit on the page background.
      const bg = bgRaw.a < 1 ? flatten(bgRaw, pageBg) : bgRaw
      const ratio = contrastRatio(fg, bg)
      results.push({ theme, fg: pair.fg, bg: pair.bg, ratio, min: pair.min, pass: ratio >= pair.min })
    }
  }
  return results
}

const isMain = process.argv[1]?.endsWith('check-contrast.ts')
if (isMain) {
  const results = checkContrast()
  const failures = results.filter((r) => !r.pass)
  for (const r of results) {
    const mark = r.pass ? '✓' : '✗'
    console.log(`${mark} ${r.theme.padEnd(5)} ${`${r.fg} on ${r.bg}`.padEnd(42)} ${r.ratio.toFixed(2).padStart(6)} (min ${r.min})`)
  }
  console.log(`\n${results.length - failures.length}/${results.length} pairs pass WCAG AA.`)
  if (failures.length) process.exit(1)
}
