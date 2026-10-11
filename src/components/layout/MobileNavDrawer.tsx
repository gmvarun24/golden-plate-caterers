'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { buttonVariants } from '@/components/ui/Button'
import { PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'
import { Drawer } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { telHref } from '@/lib/contact'

import { PRIMARY_NAV } from './nav'

export default function MobileNavDrawer({
  phone,
  whatsappHref,
  defaultOpen = false,
}: {
  phone: string
  whatsappHref: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  // Close the drawer on navigation (adjust state during render — no effect needed).
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      title="Menu"
      hideTitle
      trigger={
        <button
          type="button"
          aria-label="Open menu"
          className="grid size-11 place-items-center rounded-full text-text hover:bg-accent-soft lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            <path d="M4 8h16M8 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      }
      footer={
        <>
          <a
            href={telHref(phone)}
            data-analytics="call_click"
            className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1')}
          >
            <PhoneIcon /> Call
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp_click"
            className={cn(buttonVariants({ variant: 'leaf' }), 'flex-1')}
          >
            <WhatsAppIcon /> WhatsApp
          </a>
        </>
      }
    >
      <nav aria-label="Main" className="mt-6">
        <ul className="flex flex-col">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href} className="border-b border-border">
              <NextLink
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-4 font-display text-3xl transition-colors hover:text-accent"
              >
                {item.label}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  )
}
