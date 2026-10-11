'use client'

/**
 * Shared scroll engine: one Lenis instance (smooth wheel scrolling) and a lazily-loaded GSAP +
 * ScrollTrigger, kept in sync. GSAP is only downloaded by pages that use scroll sequences.
 */
import type { gsap as GsapInstance } from 'gsap'
import type { ScrollTrigger as ScrollTriggerInstance } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

type Gsap = typeof GsapInstance
type ScrollTriggerT = typeof ScrollTriggerInstance

let lenis: Lenis | null = null
let gsapPromise: Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerT }> | null = null
const velocityListeners = new Set<(v: number) => void>()

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function setLenis(instance: Lenis | null) {
  lenis = instance
  if (instance) {
    instance.on('scroll', ({ velocity }: { velocity: number }) => velocityListeners.forEach((fn) => fn(velocity)))
    // If GSAP was already loaded, connect it now.
    void gsapPromise?.then(({ ScrollTrigger }) => instance.on('scroll', ScrollTrigger.update))
  }
}

export const getLenis = () => lenis

/** Subscribe to scroll velocity (px/frame). Falls back to native scroll deltas without Lenis. */
export function onScrollVelocity(fn: (v: number) => void): () => void {
  velocityListeners.add(fn)
  let last = window.scrollY
  const native = () => {
    if (lenis) return
    const y = window.scrollY
    fn(y - last)
    last = y
  }
  window.addEventListener('scroll', native, { passive: true })
  return () => {
    velocityListeners.delete(fn)
    window.removeEventListener('scroll', native)
  }
}

/** GSAP + ScrollTrigger, loaded once on demand and synced with Lenis. */
export function loadGsap() {
  gsapPromise ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
    const { gsap } = g
    const { ScrollTrigger } = st
    gsap.registerPlugin(ScrollTrigger)
    if (lenis) lenis.on('scroll', ScrollTrigger.update)
    return { gsap, ScrollTrigger }
  })
  return gsapPromise
}

let realignTimer: number | undefined
let userScrolled = false
if (typeof window !== 'undefined') {
  const mark = () => (userScrolled = true)
  window.addEventListener('wheel', mark, { passive: true })
  window.addEventListener('touchmove', mark, { passive: true })
  window.addEventListener('keydown', mark)
}

/**
 * Keeps the `#hash` target in view for a short window after arriving. Pins and lazy scenes
 * change the page height after the browser's own anchor jump, so we re-check a few times and
 * stop immediately once the visitor scrolls themselves.
 */
export function alignToHashFor(ms = 2500) {
  userScrolled = false
  const started = performance.now()
  const tick = () => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    const el = id ? document.getElementById(id) : null
    if (el && !userScrolled) {
      const top = Math.round(el.getBoundingClientRect().top + window.scrollY - 80)
      if (Math.abs(window.scrollY - top) > 2) {
        if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
        else window.scrollTo({ top, behavior: 'instant' })
      }
    }
    if (!userScrolled && performance.now() - started < ms) window.setTimeout(tick, 200)
  }
  tick()
}

/** Scenes call this once built: re-measure every ScrollTrigger after pins change the layout. */
export function refreshAndRealign() {
  window.clearTimeout(realignTimer)
  realignTimer = window.setTimeout(() => {
    void gsapPromise?.then(({ ScrollTrigger }) => ScrollTrigger.refresh())
  }, 150)
}
