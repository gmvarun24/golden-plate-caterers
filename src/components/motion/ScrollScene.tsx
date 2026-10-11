'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { loadGsap, prefersReducedMotion, refreshAndRealign } from './scroll-engine'

type Gsap = Awaited<ReturnType<typeof loadGsap>>

type Props = {
  children: ReactNode
  className?: string
  /** Only run at or above this width (CSS media query), e.g. '(min-width: 64rem)'. */
  media?: string
  /** Builds the GSAP timeline/ScrollTriggers for this scene; return value is cleaned up by gsap.context. */
  setup: (root: HTMLElement, lib: Gsap) => void
}

/**
 * Lazily loads GSAP + ScrollTrigger and runs `setup` inside a gsap.matchMedia context, so scenes
 * only exist when the media query matches and motion is welcome — and are fully reverted
 * (styles, pins, triggers) when it stops matching or the component unmounts.
 */
export function ScrollScene({ children, className, media = '(min-width: 0px)', setup }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const setupRef = useRef(setup)
  useEffect(() => {
    setupRef.current = setup
  })

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return
    let revert = () => {}
    let cancelled = false
    void loadGsap().then((lib) => {
      if (cancelled || !ref.current) return
      const mm = lib.gsap.matchMedia()
      mm.add(`${media} and (prefers-reduced-motion: no-preference)`, () => {
        const ctx = lib.gsap.context(() => setupRef.current(ref.current!, lib), ref.current!)
        return () => ctx.revert()
      })
      // New pin spacers change the page height: re-measure and honour any #hash.
      refreshAndRealign()
      revert = () => mm.revert()
    })
    return () => {
      cancelled = true
      revert()
    }
  }, [media])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
