'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const SonnerToaster = dynamic(() => import('./SonnerToaster'), { ssr: false })

/**
 * Mounts the toast container once the page is idle (or immediately when a toast fires first),
 * keeping sonner (~11 KB) out of the initial bundle.
 */
export function Toaster() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000))
    const id = idle(() => setReady(true))
    const onDemand = () => setReady(true)
    window.addEventListener('gp:toast', onDemand, { once: true })
    return () => {
      window.removeEventListener('gp:toast', onDemand)
      if (typeof id === 'number') window.cancelIdleCallback?.(id)
    }
  }, [])
  return ready ? <SonnerToaster /> : null
}
