/**
 * Renders the PNG app icons the web app manifest and iOS need from the brand mark.
 *
 *   npm run generate:pwa-icons
 *
 * Outputs (public/icons/)
 *   icon-192.png, icon-512.png        rounded tile, transparent corners ("any" purpose)
 *   maskable-512.png                  full-bleed tile, mark inside the 80% safe zone
 *   apple-touch-icon.png (180×180)    full-bleed tile; iOS applies its own rounding
 *
 * Re-run after replacing public/brand/favicon.svg with a real logo.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = (p: string) => path.join(root, 'public/icons', p)

/** The favicon is a 64×64 rounded espresso tile with the gold mark on it. */
const favicon = readFileSync(path.join(root, 'public/brand/favicon.svg'), 'utf8')
const TILE = '#16120E'

/** Same artwork on a square, full-bleed tile, scaled to `scale` of the canvas around its centre. */
function fullBleed(scale: number): string {
  const inner = favicon
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>.*?<\/title>/, '')
    .replace(/<rect[^>]*\/>/, '')
  const offset = (64 - 64 * scale) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${TILE}"/><g transform="translate(${offset} ${offset}) scale(${scale})">${inner}</g></svg>`
}

async function render(svg: string, size: number, file: string) {
  await sharp(Buffer.from(svg), { density: (72 * size) / 64 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out(file))
  console.log(`✓ public/icons/${file}`)
}

await render(favicon, 192, 'icon-192.png')
await render(favicon, 512, 'icon-512.png')
// Maskable: launchers may crop to a circle of 80% diameter, so keep the mark well inside it.
await render(fullBleed(0.7), 512, 'maskable-512.png')
await render(fullBleed(0.85), 180, 'apple-touch-icon.png')
