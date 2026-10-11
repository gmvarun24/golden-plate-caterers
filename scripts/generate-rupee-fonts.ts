/**
 * Builds two tiny one-glyph fonts containing only "₹" (U+20B9), cut from the brand fonts.
 * Used via `unicode-range: U+20B9` so prices never pull in the ~100 KB latin-ext font files.
 *   npm run generate:rupee
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import opentype from 'opentype.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const load = (file: string) => {
  const b = readFileSync(path.join(root, 'node_modules/@fontsource', file))
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength))
}

function build(source: opentype.Font, family: string, out: string) {
  const src = source.charToGlyph('₹')
  if (!src || src.index === 0) throw new Error(`₹ not found for ${family}`)
  const notdef = new opentype.Glyph({ name: '.notdef', unicode: 0, advanceWidth: source.unitsPerEm / 2, path: new opentype.Path() })
  const rupee = new opentype.Glyph({ name: 'rupee', unicode: 0x20b9, advanceWidth: src.advanceWidth ?? source.unitsPerEm / 2, path: src.path })
  const font = new opentype.Font({
    familyName: family,
    styleName: 'Regular',
    unitsPerEm: source.unitsPerEm,
    ascender: source.ascender,
    descender: source.descender,
    glyphs: [notdef, rupee],
  })
  const buf = Buffer.from(font.toArrayBuffer())
  writeFileSync(path.join(root, 'public/fonts', out), buf)
  console.log(`✓ ${out} (${buf.length} bytes)`)
}

build(load('fraunces/files/fraunces-latin-ext-400-normal.woff'), 'GP Rupee Serif', 'rupee-serif.otf')
build(load('inter-tight/files/inter-tight-latin-ext-500-normal.woff'), 'GP Rupee Sans', 'rupee-sans.otf')
