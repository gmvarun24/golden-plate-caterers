'use client'

import Script from 'next/script'
import { useEffect } from 'react'

import { track, type AnalyticsEvent } from '@/lib/analytics'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID

const TRACKED = new Set<AnalyticsEvent>(['whatsapp_click', 'call_click', 'email_click'])

/**
 * GA4 (only when NEXT_PUBLIC_GA4_ID is set, loaded after the page is interactive) plus a single
 * delegated click listener that turns `data-analytics="…"` links into custom events.
 */
export function Analytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-analytics]')
      const name = el?.dataset.analytics as AnalyticsEvent | undefined
      if (name && TRACKED.has(name)) track(name, { path: window.location.pathname })
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  if (!GA_ID) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  )
}
