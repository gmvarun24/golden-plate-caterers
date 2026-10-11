'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { onScrollVelocity, prefersReducedMotion } from '@/components/motion/scroll-engine'

/**
 * Speeds the CSS marquee up (and reverses it when scrolling up) in proportion to scroll velocity,
 * easing back to its resting speed. Uses the Web Animations API playbackRate — no re-layout.
 */
export function MarqueeVelocity({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return
    const animation = ref.current.querySelector<HTMLElement>('[data-marquee-track]')?.getAnimations()[0]
    if (!animation) return
    let target = 1
    let current = 1
    let raf = 0
    const tick = () => {
      current += (target - current) * 0.08
      target += (1 - target) * 0.05
      animation.playbackRate = current
      raf = Math.abs(current - 1) > 0.01 || Math.abs(target - 1) > 0.01 ? requestAnimationFrame(tick) : 0
      if (!raf) animation.playbackRate = 1
    }
    const off = onScrollVelocity((v) => {
      target = Math.max(-4, Math.min(6, 1 + v / 6))
      if (!raf) raf = requestAnimationFrame(tick)
    })
    return () => {
      off()
      cancelAnimationFrame(raf)
    }
  }, [])
  return <div ref={ref}>{children}</div>
}
