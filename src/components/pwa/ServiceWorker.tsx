'use client'

import { useEffect } from 'react'

/** Registers public/sw.js (production only, so dev never serves stale bundles from a cache). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.error('[pwa] Service worker registration failed:', error)
      })
    }
    // Wait for load so the worker's precache never competes with the first paint.
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])
  return null
}
