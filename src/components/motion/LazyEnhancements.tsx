'use client'

import dynamic from 'next/dynamic'

/** Loads the enhancement bundle (cursor, smooth scroll, reveals, analytics) off the critical path. */
const Enhancements = dynamic(() => import('./Enhancements'), { ssr: false })

export function LazyEnhancements() {
  return <Enhancements />
}
