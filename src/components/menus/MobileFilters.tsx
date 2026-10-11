'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Modal'

import { useMenuFilters } from './FiltersContext'

/** Phones: filters live in a bottom sheet behind a "Filters (n)" button. */
export function MobileFilters({ activeCount, resultCount, children }: { activeCount: number; resultCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { reset, isPending } = useMenuFilters()
  return (
    <Drawer
      side="bottom"
      open={open}
      onOpenChange={setOpen}
      title="Filters"
      trigger={
        <Button variant="secondary" className="lg:hidden">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M4 7h10M18 7h2M4 17h4M12 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="17" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Filters{activeCount > 0 && ` (${activeCount})`}
        </Button>
      }
      footer={
        <>
          <Button variant="ghost" onClick={reset} disabled={activeCount === 0}>
            Clear all
          </Button>
          <Button className="flex-1" onClick={() => setOpen(false)} loading={isPending}>
            Show {resultCount} {resultCount === 1 ? 'menu' : 'menus'}
          </Button>
        </>
      }
    >
      {children}
    </Drawer>
  )
}
