'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'
import { formatINR } from '@/lib/format/currency'
import { duration, ease } from '@/lib/motion/tokens'

/** Cubic-bezier evaluator (x→y) for our easing tokens. */
function bezier([x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t
  const sy = (t: number) => ((ay * t + by) * t + cy) * t
  return (x: number) => {
    let t = x
    for (let i = 0; i < 6; i++) {
      const dx = sx(t) - x
      const d = (3 * ax * t + 2 * bx) * t + cx
      if (Math.abs(dx) < 1e-4 || d === 0) break
      t -= dx / d
    }
    return sy(Math.min(1, Math.max(0, t)))
  }
}
const easeOut = bezier(ease.outExpo)

/**
 * ₹ total that counts to its new value (transform-free text update, rAF only while animating).
 * Instant under reduced motion. Screen readers get the final value once, not every frame.
 */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const start = from.current
    if (start === value) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    const tick = (now: number) => {
      // Reduced motion: jump straight to the final value on the next frame.
      const p = reduce ? 1 : Math.min(1, (now - t0) / duration.slower)
      const v = Math.round(start + (value - start) * easeOut(p))
      from.current = v
      setShown(v)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [value])

  return (
    <span className={cn('tabular', className)}>
      <span aria-hidden="true">{formatINR(shown)}</span>
      <span className="sr-only">{formatINR(value)}</span>
    </span>
  )
}
