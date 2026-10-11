'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

import { cn } from '@/lib/cn'
import { CONTRAST_PAIRS } from '@/lib/color/contrast-pairs'
import { contrastRatio, parseColor, wcagLevel } from '@/lib/color/contrast'

const toHex = (rgb: string) => {
  const c = parseColor(rgb)
  if (!c) return rgb
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a < 1 ? h(c.a * 255) : ''}`.toUpperCase()
}

/**
 * Measure computed colours: on mount, whenever the element scrolls into view (stylesheets can
 * still be applying on first mount in dev) and whenever the global theme changes.
 */
function useMeasure(ref: RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const el = ref.current
    cb()
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && cb())
    if (el) io.observe(el)
    const mo = new MutationObserver(cb)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function Swatch({ name, cssVar, compact }: { name: string; cssVar: string; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hex, setHex] = useState('')
  useMeasure(ref, () => {
    if (ref.current) setHex(toHex(getComputedStyle(ref.current).backgroundColor))
  })
  return (
    <div className="flex flex-col gap-1.5">
      <div
        ref={ref}
        className={cn('rounded-md border border-border', compact ? 'h-12' : 'h-16')}
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="text-xs font-medium leading-tight">{name}</span>
      <code className="font-mono text-[0.6875rem] text-text-muted">{hex || '…'}</code>
    </div>
  )
}

/** Live WCAG ratios for every required pair, resolved in this theme. */
export function ContrastGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const [ratios, setRatios] = useState<number[]>([])
  useMeasure(ref, () => {
    const root = ref.current
    if (!root) return
    const cells = Array.from(root.querySelectorAll<HTMLElement>('[data-pair]'))
    setRatios(
      cells.map((el) => {
        const cs = getComputedStyle(el)
        const fg = parseColor(cs.color)
        const bg = parseColor(cs.backgroundColor)
        return fg && bg ? contrastRatio(fg, bg) : 0
      }),
    )
  })
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <span className="eyebrow text-text-muted">WCAG contrast</span>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {CONTRAST_PAIRS.map((p, i) => {
          const ratio = ratios[i]
          const pass = ratio !== undefined && ratio >= p.min
          return (
            <li key={`${p.fg}/${p.bg}`} className="flex items-center gap-2 text-xs">
              <span
                data-pair
                className="grid h-7 w-10 shrink-0 place-items-center rounded-sm border border-border font-medium"
                style={{ color: `var(--color-${p.fg})`, backgroundColor: `var(--color-${p.bg})` }}
              >
                Aa
              </span>
              <span className="min-w-0 flex-1 truncate" title={p.note}>
                {p.fg} / {p.bg}
              </span>
              <span className={cn('tabular font-medium', ratio === undefined ? 'text-text-muted' : pass ? 'text-success' : 'text-danger')}>
                {ratio ? `${ratio.toFixed(2)} · ${p.min === 3 && pass ? '≥3' : wcagLevel(ratio)}` : '…'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
