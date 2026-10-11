'use client'

import type { ReactNode } from 'react'

import { ScrollScene } from '@/components/motion/ScrollScene'

/**
 * Desktop: pins "How it works" and walks through the four steps as you scroll — a gold progress
 * line fills and each step lights up in turn. Phones / reduced motion: a plain list.
 */
export function PinnedSteps({ children }: { children: ReactNode }) {
  return (
    <ScrollScene
      media="(min-width: 64rem)"
      setup={(root, { gsap }) => {
        const section = root.closest('section') ?? root
        const steps = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-step]'))
        const progress = root.querySelector('[data-step-progress]')
        if (!steps.length || !progress) return

        const firstStep = steps[0]
        if (!firstStep) return
        gsap.set(steps, { opacity: 0.28 })
        gsap.set(firstStep, { opacity: 1 })
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${Math.max(window.innerHeight * 1.8, steps.length * 280)}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: steps.length }, 0)
        steps.forEach((step, i) => {
          if (i === 0) return
          tl.to(step, { opacity: 1, duration: 0.35 }, i - 0.2)
        })
      }}
    >
      {children}
    </ScrollScene>
  )
}
