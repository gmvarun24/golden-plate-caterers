import { useId, type CSSProperties } from 'react'

import { cn } from '@/lib/cn'

import { CATERERS, LOGO_VIEWBOX, MARK, MARK_SIZE, WORDMARK } from './logo-geometry'

/** The "G" plate monogram: open gold rim + crossbar, faint inner well, one highlight. */
function MarkShapes({ gradientId, mono }: { gradientId: string; mono?: boolean }) {
  return (
    <>
      {!mono && (
        <defs>
          <linearGradient id={gradientId} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            {/* Deeper golds on ivory, brighter champagne golds on espresso. */}
            <stop offset="0" style={{ stopColor: 'light-dark(var(--palette-gold-500), var(--palette-champagne))' }} />
            <stop offset=".5" style={{ stopColor: 'light-dark(var(--palette-gold-600), var(--palette-gold-400))' }} />
            <stop offset="1" style={{ stopColor: 'light-dark(var(--palette-gold-700), var(--palette-gold-500))' }} />
          </linearGradient>
        </defs>
      )}
      <circle
        cx={MARK.c}
        cy={MARK.c}
        r={MARK.wellR}
        fill="none"
        stroke={mono ? 'currentColor' : 'var(--color-accent-fill)'}
        strokeWidth={1}
        opacity={mono ? 0.35 : 0.45}
      />
      <path
        d={MARK.g}
        fill="none"
        stroke={mono ? 'currentColor' : `url(#${gradientId})`}
        strokeWidth={MARK.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={MARK.highlight.cx}
        cy={MARK.highlight.cy}
        r={MARK.highlight.r}
        fill={mono ? 'currentColor' : 'light-dark(var(--palette-gold-500), var(--palette-champagne))'}
      />
    </>
  )
}

type LogoProps = {
  className?: string
  style?: CSSProperties
  /** Single-colour version (uses currentColor for everything). */
  mono?: boolean
  /** Accessible name; defaults to the full brand name. */
  title?: string
}

const mask = (src: string): CSSProperties => ({
  maskImage: `url(${src})`,
  WebkitMaskImage: `url(${src})`,
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
})

/**
 * Full lockup. The mark is inline SVG (tiny); "Golden Plate" and "CATERERS" are cached
 * single-colour SVGs used as CSS masks, coloured by tokens (text colour + gold), so the logo
 * follows the theme without inlining kilobytes of glyph paths. Size with `className="h-10"`.
 */
export function Logo({ mono, title = 'Golden Plate Caterers', className, style }: LogoProps) {
  const gradientId = `gp-gold-${useId().replace(/:/g, '')}`
  const { width: W, height: H } = LOGO_VIEWBOX
  // Everything is positioned in % of the lockup box, whose size comes from its height + aspect ratio.
  const box = (b: { x: number; y: number; width: number; height: number }): CSSProperties => ({
    position: 'absolute',
    left: `${(b.x / W) * 100}%`,
    top: `${(b.y / H) * 100}%`,
    width: `${(b.width / W) * 100}%`,
    height: `${(b.height / H) * 100}%`,
  })
  return (
    <span
      role="img"
      aria-label={title}
      className={cn('relative inline-block shrink-0 text-text', className)}
      style={{ aspectRatio: `${W} / ${H}`, ...style }}
    >
      <svg
        viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
        aria-hidden="true"
        className="absolute top-0 left-0 h-full"
        style={{ width: `${(MARK_SIZE / W) * 100}%` }}
      >
        <MarkShapes gradientId={gradientId} mono={mono} />
      </svg>
      <span aria-hidden="true" className="bg-current" style={{ ...box(WORDMARK), ...mask(WORDMARK.src) }} />
      <span
        aria-hidden="true"
        className={mono ? 'bg-current' : 'bg-accent'}
        style={{ ...box(CATERERS), ...mask(CATERERS.src) }}
      />
    </span>
  )
}

/** The monogram on its own (compact header, loaders, empty states). */
export function LogoMark({ mono, title, className, style }: LogoProps) {
  const gradientId = `gp-mark-${useId().replace(/:/g, '')}`
  return (
    <svg
      viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn('text-accent', className)}
      style={style}
    >
      <MarkShapes gradientId={gradientId} mono={mono} />
    </svg>
  )
}
