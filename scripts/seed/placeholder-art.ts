/**
 * Generates tasteful abstract "thali from above" placeholder images (no stock photos, nothing
 * identifying). Deterministic per key so re-seeding produces identical files. Replace with real
 * photography in /admin → Media before launch.
 */
import sharp from 'sharp'

const PALETTES = {
  gold: { bg: ['#2C241C', '#16120E'], rim: '#C9A24B', bowls: ['#E39B3A', '#F0DFB4', '#B8432F', '#8DA47E', '#E2C27A'] },
  leaf: { bg: ['#2F5D46', '#1B3A2B'], rim: '#E2C27A', bowls: ['#F1E9DA', '#E39B3A', '#C9A24B', '#8DA47E', '#F8F3EA'] },
  chili: { bg: ['#3A1C14', '#1E1913'], rim: '#C9A24B', bowls: ['#B8432F', '#E39B3A', '#F0DFB4', '#8A2E1F', '#E2C27A'] },
  saffron: { bg: ['#5A3A12', '#2C241C'], rim: '#F0DFB4', bowls: ['#E39B3A', '#F8F3EA', '#8DA47E', '#C9A24B', '#B8432F'] },
} as const
export type ArtPalette = keyof typeof PALETTES

/** Small deterministic PRNG (mulberry32) seeded from a string. */
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export async function placeholderArt(key: string, palette: ArtPalette, width = 1600, height = 1100): Promise<Buffer> {
  const p = PALETTES[palette]
  const r = rng(key)
  const cx = width * (0.42 + r() * 0.16)
  const cy = height * (0.45 + r() * 0.1)
  const R = Math.min(width, height) * (0.36 + r() * 0.06)
  const bowls = 5 + Math.floor(r() * 3)
  const offset = r() * Math.PI * 2

  const bowlSvg = Array.from({ length: bowls }, (_, i) => {
    const a = offset + (i / bowls) * Math.PI * 2
    const d = R * 0.62
    const br = R * (0.17 + r() * 0.05)
    const x = cx + Math.cos(a) * d
    const y = cy + Math.sin(a) * d
    const fill = p.bowls[i % p.bowls.length]
    return `<g><circle cx="${x}" cy="${y}" r="${br + 6}" fill="#000" opacity=".18"/><circle cx="${x}" cy="${y}" r="${br}" fill="url(#bowl)"/><circle cx="${x}" cy="${y}" r="${br * 0.8}" fill="${fill}" opacity=".92"/><circle cx="${x - br * 0.25}" cy="${y - br * 0.25}" r="${br * 0.18}" fill="#fff" opacity=".12"/></g>`
  }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <radialGradient id="bg" cx="${cx / width}" cy="${cy / height}" r="0.9">
      <stop offset="0" stop-color="${p.bg[0]}"/><stop offset="1" stop-color="${p.bg[1]}"/>
    </radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9C7A2E"/><stop offset=".45" stop-color="${p.rim}"/><stop offset="1" stop-color="#9C7A2E"/>
    </linearGradient>
    <radialGradient id="plate" cx=".4" cy=".35" r=".8">
      <stop offset="0" stop-color="#F0DFB4" stop-opacity=".22"/><stop offset="1" stop-color="#2C241C" stop-opacity=".05"/>
    </radialGradient>
    <radialGradient id="bowl" cx=".35" cy=".3" r=".9">
      <stop offset="0" stop-color="#E2C27A"/><stop offset="1" stop-color="#7A5E22"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .08 0"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="${cx + 18}" cy="${cy + 26}" r="${R}" fill="#000" opacity=".28"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#plate)"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="url(#rim)" stroke-width="${R * 0.05}"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.88}" fill="none" stroke="${p.rim}" stroke-width="2" opacity=".45"/>
  ${bowlSvg}
  <circle cx="${cx}" cy="${cy}" r="${R * 0.24}" fill="#F1E9DA" opacity=".9"/>
  <path d="M ${cx - R * 0.95} ${cy - R * 0.32} A ${R} ${R} 0 0 1 ${cx - R * 0.45} ${cy - R * 0.88}" fill="none" stroke="#FFF4D6" stroke-width="${R * 0.02}" stroke-linecap="round" opacity=".75"/>
  <rect width="100%" height="100%" filter="url(#grain)"/>
</svg>`
  return sharp(Buffer.from(svg)).webp({ quality: 84 }).toBuffer()
}
