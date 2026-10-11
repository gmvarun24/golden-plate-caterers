'use client'

import type { ReactNode } from 'react'

import { ScrollScene } from '@/components/motion/ScrollScene'

/**
 * Desktop: the page keeps scrolling normally until the whole row of cards (including the titles
 * on the images) is in view, then the section pins and vertical scrolling drives the row
 * horizontally. When the last card is in view, normal scrolling resumes.
 * Phones/tablets keep the native swipeable carousel (scroll-snap).
 */
export function HorizontalOccasions({ children }: { children: ReactNode }) {
  return (
    <ScrollScene
      media="(min-width: 64rem)"
      setup={(root, { gsap }) => {
        const section = root.closest('section') ?? root
        const track = root.querySelector<HTMLElement>('[data-hscroll]')
        if (!track) return
        const distance = () => Math.max(0, track.scrollWidth - track.clientWidth)
        if (distance() < 40) return
        gsap.set(track, { overflowX: 'visible' })
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            // Start only once the bottom of the cards (where the titles sit) is on screen.
            trigger: track,
            start: 'bottom bottom-=32',
            end: () => `+=${distance()}`,
            pin: section,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
      }}
    >
      {children}
    </ScrollScene>
  )
}
