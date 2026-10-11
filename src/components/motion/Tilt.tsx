'use client'

import { useRef, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * Subtle 3D tilt toward the pointer (mouse only, max ±4°). Transform-only and rAF-throttled;
 * does nothing on touch or under reduced motion (CSS handles the reset).
 */
export function Tilt({ children, className, max = 4 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`
    })
  }
  const reset = () => {
    cancelAnimationFrame(frame.current)
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn('h-full transition-transform duration-(--duration-base) ease-out-expo will-change-transform', className)}
    >
      {children}
    </div>
  )
}
