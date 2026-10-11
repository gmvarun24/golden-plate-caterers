/**
 * Open Graph image renderer (next/og). Brand colours are literal here because ImageResponse
 * can't read CSS variables — they mirror the dark-theme tokens in tokens.css.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { MARK } from '@/components/brand/logo-geometry'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const C = {
  bg: '#16120E',
  surface: '#211B15',
  text: '#F3EADB',
  muted: '#B8AC98',
  gold: '#C9A24B',
  goldLight: '#E2C27A',
  goldDeep: '#9C7A2E',
  champagne: '#F0DFB4',
}

const font = (pkg: string, file: string) => readFile(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file))

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 500; style: 'normal' | 'italic' }[]> | null = null
function loadFonts() {
  fontsPromise ??= Promise.all([
    font('fraunces', 'fraunces-latin-400-normal.woff'),
    font('fraunces', 'fraunces-latin-400-italic.woff'),
    font('inter-tight', 'inter-tight-latin-500-normal.woff'),
    font('inter-tight', 'inter-tight-latin-ext-500-normal.woff'), // ₹ lives in latin-ext
  ]).then(([serif, serifItalic, sans, sansExt]) => [
    { name: 'Fraunces', data: serif, weight: 400, style: 'normal' },
    { name: 'Fraunces', data: serifItalic, weight: 400, style: 'italic' },
    { name: 'Inter Tight', data: sans, weight: 500, style: 'normal' },
    // Separate family name: satori falls back by family, not by duplicate entries.
    { name: 'Inter Tight Ext', data: sansExt, weight: 500, style: 'normal' },
  ])
  return fontsPromise
}

type OgProps = { eyebrow: string; title: string; subtitle?: string; footer?: string }

export async function renderOgImage({ eyebrow, title, subtitle, footer = 'Golden Plate Caterers' }: OgProps) {
  const fonts = await loadFonts()
  // `*words*` → gold italic, like the site's headlines.
  const parts = title.split(/(\*[^*]+\*)/g).filter(Boolean)
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: `radial-gradient(circle at 82% 40%, ${C.surface} 0%, ${C.bg} 60%)`,
          color: C.text,
          padding: 72,
          fontFamily: 'Inter Tight, Inter Tight Ext',
          position: 'relative',
        }}
      >
        {/* The plate mark, large, bleeding off the right edge */}
        <svg width="520" height="520" viewBox="0 0 64 64" style={{ position: 'absolute', right: -90, top: 55 }}>
          <defs>
            <linearGradient id="g" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={C.goldLight} />
              <stop offset=".5" stopColor={C.gold} />
              <stop offset="1" stopColor={C.goldDeep} />
            </linearGradient>
          </defs>
          <circle cx={MARK.c} cy={MARK.c} r={MARK.wellR} fill="none" stroke={C.gold} strokeWidth=".6" opacity=".45" />
          <path d={MARK.g} fill="none" stroke="url(#g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={MARK.highlight.cx} cy={MARK.highlight.cy} r="1.6" fill={C.champagne} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 760 }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 5, textTransform: 'uppercase', color: C.goldLight }}>{eyebrow}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', fontFamily: 'Fraunces', fontSize: title.length > 40 ? 68 : 84, lineHeight: 1.02, letterSpacing: -2 }}>
              {parts.map((p, i) =>
                p.startsWith('*') ? (
                  <span key={i} style={{ fontStyle: 'italic', color: C.goldLight, marginRight: 18 }}>
                    {p.slice(1, -1)}
                  </span>
                ) : (
                  <span key={i} style={{ marginRight: 18 }}>
                    {p.trim()}
                  </span>
                ),
              )}
            </div>
            {subtitle && <div style={{ display: 'flex', fontSize: 30, color: C.muted }}>{subtitle}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, color: C.muted }}>
            <div style={{ display: 'flex', width: 48, height: 2, background: `linear-gradient(90deg, ${C.goldDeep}, ${C.goldLight})` }} />
            {footer}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
