'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

/** The drawer (Radix Dialog) loads on first tap — the header ships only this button. */
const MobileNavDrawer = dynamic(() => import('./MobileNavDrawer'), { ssr: false })

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
    <path d="M4 8h16M8 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export function MobileNav(props: { phone: string; whatsappHref: string }) {
  const [loaded, setLoaded] = useState(false)
  if (loaded) return <MobileNavDrawer {...props} defaultOpen />
  return (
    <button
      type="button"
      aria-label="Open menu"
      aria-haspopup="dialog"
      onClick={() => setLoaded(true)}
      onPointerEnter={() => void import('./MobileNavDrawer')}
      className="grid size-11 place-items-center rounded-full text-text hover:bg-accent-soft lg:hidden"
    >
      <MenuIcon />
    </button>
  )
}
