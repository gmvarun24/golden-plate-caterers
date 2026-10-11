/**
 * Fails if a component or page hard-codes a colour (hex, rgb(), hsl(), oklch()) instead of
 * using a semantic token. Allowed places: src/styles/tokens.css and the files listed below.
 *   npm run check:colors
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCAN = ['src/components', 'src/app/(frontend)']
const EXT = /\.(tsx?|css)$/
/** Files that legitimately need literal colours. */
const ALLOW = new Set([
  'src/components/brand/AdminGraphics.tsx', // admin panel does not load our tokens
  'src/components/brand/logo-geometry.ts', // generated
  'src/app/(frontend)/layout.tsx', // <meta name="theme-color"> needs literals (mirrors --color-bg)
])
const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g
/** Primitives are for tokens.css only; components use semantic tokens (brand marks excepted). */
const PALETTE = /var\(--palette-[a-z0-9-]+\)/g

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : EXT.test(name) ? [p] : []
  })
}

const problems: string[] = []
for (const base of SCAN) {
  for (const file of walk(path.join(root, base))) {
    const rel = path.relative(root, file)
    if (ALLOW.has(rel)) continue
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        // Ignore url(#id) references to SVG gradients/masks and `#anchor` hrefs.
        const cleaned = line.replace(/url\(#[^)]*\)/g, '').replace(/href=["'{`][^"'}`]*#[\w-]+/g, '')
        for (const m of cleaned.matchAll(COLOR)) {
          problems.push(`${rel}:${i + 1}  ${m[0]}  →  use a semantic token from tokens.css`)
        }
        if (!rel.startsWith('src/components/brand/')) {
          for (const m of line.matchAll(PALETTE)) {
            problems.push(`${rel}:${i + 1}  ${m[0]}  →  primitives are not for components; use a --color-* token`)
          }
        }
      })
  }
}

if (problems.length) {
  console.error(`✗ Raw colour values found:\n${problems.join('\n')}`)
  process.exit(1)
}
console.log('✓ No raw colour values in components or pages.')
