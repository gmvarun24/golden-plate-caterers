/**
 * Generates the placeholder brand logo from the brand fonts, with text outlined to paths so
 * the SVGs render identically everywhere (img tags, emails, OG images, admin).
 *
 *   npm run generate:logo
 *
 * Outputs
 *   public/brand/{logo,mark}-{light,dark,mono}.svg, favicon.svg, wordmark.svg, caterers.svg
 *   src/components/brand/logo-geometry.ts   (same geometry for the inline React <Logo/>)
 *
 * To use a real logo instead, drop SVGs into public/brand/ (same filenames) or upload them in
 * /admin → Brand Settings. This script is only for the placeholder.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import opentype from 'opentype.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = (p: string) => path.join(root, p)

function loadFont(file: string): opentype.Font {
  const buf = readFileSync(out(`node_modules/@fontsource/${file}`))
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
}

const display = loadFont('fraunces/files/fraunces-latin-400-normal.woff')
const body = loadFont('inter-tight/files/inter-tight-latin-500-normal.woff')

const r = (n: number) => Math.round(n * 100) / 100

/** Serialise path commands ourselves: opentype.js 1.x `toPathData()` can emit NaN when rounding. */
function pathData(p: opentype.Path): string {
  const n = (v: number | undefined) => {
    if (v === undefined || !Number.isFinite(v)) throw new Error('Non-finite coordinate in glyph path')
    return String(r(v))
  }
  return p.commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
        case 'Z':
          return 'Z'
      }
    })
    .join('')
}

/** Lay out text glyph by glyph (kerning + tracking) and return path data + advance width. */
function textPath(font: opentype.Font, text: string, size: number, x: number, y: number, tracking = 0) {
  const scale = size / font.unitsPerEm
  let cursor = x
  const parts: string[] = []
  // Plain cmap lookup: opentype.js 1.x cannot apply some of these fonts' GSUB lookups.
  const glyphs = Array.from(text).map((ch) => font.charToGlyph(ch))
  glyphs.forEach((glyph, i) => {
    parts.push(pathData(glyph.getPath(cursor, y, size)))
    const next = glyphs[i + 1]
    const kern = next ? font.getKerningValue(glyph, next) : 0
    cursor += ((glyph.advanceWidth ?? 0) + kern) * scale
    if (next) cursor += tracking
  })
  return { d: parts.join(''), width: cursor - x }
}

// ── Geometry ────────────────────────────────────────────────────────────────
// Mark (64×64): a "G" monogram that is also a plate seen from above — an open gold rim with a
// crossbar, a faint inner well, and one highlight. Few strokes, so it stays crisp at 16 px.
const MARK = 64
const C = MARK / 2
const RIM_R = 25
const WELL_R = 16
const STROKE = 3.4

const pt = (deg: number, radius: number) => {
  const rad = (deg * Math.PI) / 180
  return [r(C + radius * Math.cos(rad)), r(C + radius * Math.sin(rad))] as const
}
// Angles: 0° = 3 o'clock, increasing clockwise (SVG y-down). The rim runs counter-clockwise
// from the upper right (−48°) round to 3 o'clock, then the crossbar turns inward.
const [gx1, gy1] = pt(-48, RIM_R)
const G_PATH = `M${gx1} ${gy1}A${RIM_R} ${RIM_R} 0 1 0 ${C + RIM_R} ${C}L${C + 5} ${C}`
const [hx, hy] = pt(222, WELL_R)
const HIGHLIGHT = { cx: hx, cy: hy, r: 2.2 }

type Box = { x1: number; y1: number; x2: number; y2: number }
function lay(font: opentype.Font, text: string, size: number, x: number, y: number, tracking = 0) {
  const t = textPath(font, text, size, x, y, tracking)
  const scale = size / font.unitsPerEm
  // Bounding box from the glyph outlines (for tight crops of the mask SVGs).
  let cursor = x
  const box: Box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity }
  const glyphs = Array.from(text).map((ch) => font.charToGlyph(ch))
  glyphs.forEach((g, i) => {
    const gp = g.getPath(cursor, y, size)
    const b = gp.getBoundingBox()
    if (gp.commands.length > 0 && Number.isFinite(b.x1)) {
      box.x1 = Math.min(box.x1, b.x1)
      box.y1 = Math.min(box.y1, b.y1)
      box.x2 = Math.max(box.x2, b.x2)
      box.y2 = Math.max(box.y2, b.y2)
    }
    const next = glyphs[i + 1]
    cursor += ((g.advanceWidth ?? 0) + (next ? font.getKerningValue(g, next) : 0)) * scale + (next ? tracking : 0)
  })
  return { ...t, box }
}

// Lockup: mark | "Golden Plate" (display serif) over "CATERERS" (tracked caps, gold), left-aligned.
const GAP = 16
const textX = MARK + GAP
const word = lay(display, 'Golden Plate', 38, textX, 34, -0.4)
const CAPS_SIZE = 12.5
const caps = lay(body, 'CATERERS', CAPS_SIZE, textX + 1, 54, CAPS_SIZE * 0.5)
const LOGO_W = Math.ceil(Math.max(word.box.x2, caps.box.x2) + 2)
const LOGO_H = MARK

// ── Colour schemes (mirror tokens.css primitives) ───────────────────────────
type Scheme = { text: string; accent: string; well: string; light: string; gradient?: [string, string, string] }
const schemes: Record<'light' | 'dark' | 'mono', Scheme> = {
  light: { text: '#1E1913', accent: '#7A5E22', well: '#C9A24B', light: '#E2C27A', gradient: ['#7A5E22', '#C9A24B', '#E2C27A'] },
  dark: { text: '#F3EADB', accent: '#E2C27A', well: '#C9A24B', light: '#FFF4D6', gradient: ['#C9A24B', '#F0DFB4', '#E2C27A'] },
  mono: { text: 'currentColor', accent: 'currentColor', well: 'currentColor', light: 'currentColor' },
}

const defs = (s: Scheme) =>
  s.gradient
    ? `<defs><linearGradient id="gp-gold" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${s.gradient[2]}"/><stop offset=".5" stop-color="${s.gradient[1]}"/><stop offset="1" stop-color="${s.gradient[0]}"/></linearGradient></defs>`
    : ''

const markShapes = (s: Scheme, stroke = STROKE) =>
  `<circle cx="${C}" cy="${C}" r="${WELL_R}" fill="none" stroke="${s.well}" stroke-width="1" opacity="${s.gradient ? 0.45 : 0.35}"/>` +
  `<path d="${G_PATH}" fill="none" stroke="${s.gradient ? 'url(#gp-gold)' : s.accent}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<circle cx="${HIGHLIGHT.cx}" cy="${HIGHLIGHT.cy}" r="${HIGHLIGHT.r}" fill="${s.light}"/>`

const svg = (w: number, h: number, title: string, inner: string, viewBox = `0 0 ${w} ${h}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>\n`

for (const [name, s] of Object.entries(schemes)) {
  writeFileSync(
    out(`public/brand/logo-${name}.svg`),
    svg(LOGO_W, LOGO_H, 'Golden Plate Caterers', `${defs(s)}${markShapes(s)}<path d="${word.d}" fill="${s.text}"/><path d="${caps.d}" fill="${s.accent}"/>`),
  )
  writeFileSync(out(`public/brand/mark-${name}.svg`), svg(MARK, MARK, 'Golden Plate', `${defs(s)}${markShapes(s)}`))
}

// Favicon: the G on a dark rounded tile, heavier stroke so it reads at 16 px.
writeFileSync(
  out('public/brand/favicon.svg'),
  svg(MARK, MARK, 'Golden Plate', `${defs(schemes.dark)}<rect width="64" height="64" rx="14" fill="#16120E"/>${markShapes(schemes.dark, 5)}`),
)

// Text-only masks for <Logo/> (cached, recoloured by CSS): tight crops of each line.
const crop = (b: Box, pad = 1) => ({ x: r(b.x1 - pad), y: r(b.y1 - pad), w: r(b.x2 - b.x1 + pad * 2), h: r(b.y2 - b.y1 + pad * 2) })
const wc = crop(word.box)
const cc = crop(caps.box)
writeFileSync(out('public/brand/wordmark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${wc.x} ${wc.y} ${wc.w} ${wc.h}" width="${wc.w}" height="${wc.h}"><path d="${word.d}"/></svg>\n`)
writeFileSync(out('public/brand/caterers.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cc.x} ${cc.y} ${cc.w} ${cc.h}" width="${cc.w}" height="${cc.h}"><path d="${caps.d}"/></svg>\n`)

// Geometry for the inline React logo and admin/OG graphics.
writeFileSync(
  out('src/components/brand/logo-geometry.ts'),
  `/* Generated by scripts/generate-logo.ts — do not edit by hand. */\n` +
    `export const LOGO_VIEWBOX = { width: ${LOGO_W}, height: ${LOGO_H} } as const\n` +
    `export const MARK_SIZE = ${MARK}\n` +
    `export const MARK = { c: ${C}, wellR: ${WELL_R}, stroke: ${STROKE}, g: '${G_PATH}', highlight: ${JSON.stringify(HIGHLIGHT)} } as const\n` +
    `/** Text lines as boxes in the ${LOGO_W}×${LOGO_H} lockup, plus their mask files. */\n` +
    `export const WORDMARK = { x: ${wc.x}, y: ${wc.y}, width: ${wc.w}, height: ${wc.h}, src: '/brand/wordmark.svg' } as const\n` +
    `export const CATERERS = { x: ${cc.x}, y: ${cc.y}, width: ${cc.w}, height: ${cc.h}, src: '/brand/caterers.svg' } as const\n` +
    `export const WORDMARK_PATH = '${word.d}'\n` +
    `export const CATERERS_PATH = '${caps.d}'\n`,
)

console.log(`✓ Logo generated (${LOGO_W}×${LOGO_H}) → public/brand/ + src/components/brand/logo-geometry.ts`)
