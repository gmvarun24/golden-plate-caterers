'use client'

import { useEffect } from 'react'

import { prefersReducedMotion, setLenis } from './scroll-engine'

/**
 * Lenis smooth scrolling for wheel/trackpad (touch keeps native momentum scrolling).
 * Off under reduced motion. Pauses while a modal/drawer locks the page scroll.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let cancelled = false
    let cleanup = () => {}
    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      const lenis = new Lenis({ autoRaf: true, lerp: 0.11, smoothWheel: true, anchors: { offset: -80 } })
      setLenis(lenis)
      // Radix dialogs set data-scroll-locked on <body>; stop Lenis while they're open.
      const mo = new MutationObserver(() => {
        if (document.body.hasAttribute('data-scroll-locked')) lenis.stop()
        else lenis.start()
      })
      mo.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] })
      cleanup = () => {
        mo.disconnect()
        lenis.destroy()
        setLenis(null)
      }
    })
    return () => {
      cancelled = true
      cleanup()
    }
  }, [])
  return null
}
