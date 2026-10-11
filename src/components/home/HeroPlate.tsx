'use client'

import type { ReactNode } from 'react'

import { ScrollScene } from '@/components/motion/ScrollScene'

/**
 * The gold plate "catches the light" as you scroll: the highlight arc sweeps around the rim,
 * the plate turns slightly and the dish image drifts (parallax). Scrubbed to scroll.
 */
export function HeroPlate({ children }: { children: ReactNode }) {
  return (
    <ScrollScene
      className="relative"
      setup={(root, { gsap }) => {
        const section = root.closest('section') ?? root
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.6 },
        })
        tl.to(root.querySelector('[data-plate-shine]'), { rotate: 140, transformOrigin: '50% 50%' }, 0)
          .to(root.querySelector('[data-plate]'), { rotate: 18, scale: 0.94, yPercent: 10 }, 0)
          .to(root.querySelector('[data-plate-image]'), { scale: 1.14, rotate: -10 }, 0)
      }}
    >
      {children}
    </ScrollScene>
  )
}
