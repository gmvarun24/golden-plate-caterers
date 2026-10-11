'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * One IntersectionObserver for the whole page: any element with `data-reveal` gets
 * `data-revealed` when it scrolls into view (CSS does the animating). Re-scans on navigation.
 */
export function RevealObserver() {
  const pathname = usePathname()
  useEffect(() => {
    if (!document.documentElement.classList.contains('motion-ready')) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', '')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => io.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])
  return null
}
