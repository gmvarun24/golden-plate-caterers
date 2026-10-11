'use client'

import type { AnchorHTMLAttributes } from 'react'

import { track, type AnalyticsEvent } from '@/lib/analytics'

/** An <a> that records a custom analytics event on click. */
export function TrackedLink({ event, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { event: AnalyticsEvent }) {
  return <a {...props} onClick={(e) => {
    track(event, { location: 'quote' })
    props.onClick?.(e)
  }} />
}
