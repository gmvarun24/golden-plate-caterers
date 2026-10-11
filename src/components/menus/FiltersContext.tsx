'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useOptimistic, useTransition, type ReactNode } from 'react'

import { toQueryString, type MenuFilters } from '@/lib/catalog/filters'
import { cn } from '@/lib/cn'

type Ctx = { filters: MenuFilters; update: (patch: Partial<MenuFilters>) => void; reset: () => void; isPending: boolean }

const FiltersCtx = createContext<Ctx | null>(null)

export function useMenuFilters(): Ctx {
  const ctx = useContext(FiltersCtx)
  if (!ctx) throw new Error('useMenuFilters must be used inside <FiltersProvider>')
  return ctx
}

/**
 * Filters live in the URL (shareable). Changing one replaces the URL inside a transition; the
 * server re-renders the results. `useOptimistic` keeps the controls instant while that happens.
 */
export function FiltersProvider({ initial, children }: { initial: MenuFilters; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [filters, setOptimistic] = useOptimistic(initial)

  const navigate = (next: MenuFilters) => {
    startTransition(() => {
      setOptimistic(next)
      const qs = toQueryString(next)
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  return (
    <FiltersCtx.Provider
      value={{
        filters,
        isPending,
        update: (patch) => navigate({ ...filters, ...patch }),
        reset: () => navigate({ ...filters, occasion: null, cuisines: [], diets: [], min: null, max: null, guests: null }),
      }}
    >
      {children}
    </FiltersCtx.Provider>
  )
}

/** Wraps server-rendered results: dims and marks busy while new results load. */
export function ResultsRegion({ children, className }: { children: ReactNode; className?: string }) {
  const { isPending } = useMenuFilters()
  return (
    <div
      aria-busy={isPending}
      className={cn('transition-opacity duration-(--duration-base) ease-standard', isPending && 'opacity-50', className)}
    >
      {children}
    </div>
  )
}
