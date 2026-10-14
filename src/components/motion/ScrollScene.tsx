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
  /** Optional lighter scene for when `media` does not match (e.g. phones get no pinning). */
  otherwise?: (root: HTMLElement, lib: Gsap) => void
}

/**
 * Lazily loads GSAP + ScrollTrigger and runs `setup` inside a gsap.matchMedia context, so scenes
 * only exist when the media query matches and motion is welcome — and are fully reverted
 * (styles, pins, triggers) when it stops matching or the component unmounts. `otherwise` runs
 * in its place below the breakpoint, so phones get their own (pin-free) version of a scene.
 */
export function ScrollScene({ children, className, media = '(min-width: 0px)', setup, otherwise }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const setupRef = useRef(setup)
  const otherwiseRef = useRef(otherwise)
  useEffect(() => {
    setupRef.current = setup
    otherwiseRef.current = otherwise
  })

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return
    let revert = () => {}
    let cancelled = false
    void loadGsap().then((lib) => {
      if (cancelled || !ref.current) return
      const mm = lib.gsap.matchMedia()
      mm.add({ match: media, motion: '(prefers-reduced-motion: no-preference)' }, ({ conditions }) => {
        if (!conditions?.motion) return
        const build = conditions.match ? setupRef.current : otherwiseRef.current
        if (!build) return
        const ctx = lib.gsap.context(() => build(ref.current!, lib), ref.current!)
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
