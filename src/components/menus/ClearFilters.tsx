'use client'

import { Button } from '@/components/ui/Button'

import { useMenuFilters } from './FiltersContext'

export function ClearFilters({ label = 'Clear all filters', variant = 'link' }: { label?: string; variant?: 'link' | 'secondary' }) {
  const { reset } = useMenuFilters()
  return (
    <Button variant={variant} onClick={reset}>
      {label}
    </Button>
  )
}
