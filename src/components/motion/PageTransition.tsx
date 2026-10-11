'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ReactNode } from 'react'

import { prefersReducedMotion } from './scroll-engine'

/** Motion's curtain is code-split: the first page view never downloads it. */
const Curtain = dynamic(() => import('./Curtain'), { ssr: false })

/** Flipped after the first mount so the very first page load is never covered (protects LCP). */
const session = { navigated: false }

/**
 * Route change: an espresso curtain with a gold edge wipes up (Motion, ≈560 ms) while the new
 * page settles in (CSS). Never intercepts input; skipped on first load and under reduced motion.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [animate] = useState(() => session.navigated && typeof window !== 'undefined' && !prefersReducedMotion())
  useEffect(() => {
    session.navigated = true
    // Warm the curtain chunk once the browser is idle, ready for the first navigation.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500))
    idle(() => void import('./Curtain'))
  }, [])

  return (
    <>
      {animate && <Curtain />}
      <div className={animate ? 'page-enter' : undefined}>{children}</div>
    </>
  )
}
