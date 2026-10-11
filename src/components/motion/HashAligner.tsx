'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { alignToHashFor } from './scroll-engine'

/** After every navigation or hash change, keep the #target in view while the layout settles. */
export function HashAligner() {
  const pathname = usePathname()
  useEffect(() => {
    alignToHashFor()
    const onHash = () => alignToHashFor()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [pathname])
  return null
}
