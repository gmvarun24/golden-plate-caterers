'use client'

import { useEffect } from 'react'

const KEY = 'gp-source'

/** Remembers how the visitor first arrived (UTM tags, referrer, landing page) for this session. */
export function SourceCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return
      const q = new URLSearchParams(window.location.search)
      const pick = (k: string) => q.get(k)?.slice(0, 100) || undefined
      const external = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          utmSource: pick('utm_source'),
          utmMedium: pick('utm_medium'),
          utmCampaign: pick('utm_campaign'),
          utmTerm: pick('utm_term'),
          utmContent: pick('utm_content'),
          referrer: external?.slice(0, 300),
          landingPath: window.location.pathname.slice(0, 300),
        }),
      )
    } catch {
      /* storage unavailable */
    }
  }, [])
  return null
}

export function readSource(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}
