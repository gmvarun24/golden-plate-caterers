'use client'

import { LazyMotion, m } from 'motion/react'

import { duration, ease, seconds } from '@/lib/motion/tokens'

const loadFeatures = () => import('./motion-features').then((r) => r.default)

/** The route-change curtain (Motion). Loaded only after the first client-side navigation. */
export default function Curtain() {
  return (
    <LazyMotion features={loadFeatures} strict>
      <m.div
        aria-hidden="true"
        data-theme="dark"
        className="pointer-events-none fixed inset-0 z-(--z-transition) origin-top"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: seconds(duration.slow), ease: ease.inOutQuart, delay: 0.08 }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-gold" />
      </m.div>
    </LazyMotion>
  )
}
