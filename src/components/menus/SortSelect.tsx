'use client'

import { Select } from '@/components/ui/Select'
import { SORTS, type Sort } from '@/lib/catalog/filters'

import { useMenuFilters } from './FiltersContext'

export function SortSelect() {
  const { filters, update } = useMenuFilters()
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="menus-sort" className="text-sm whitespace-nowrap text-text-muted">
        Sort by
      </label>
      <Select
        id="menus-sort"
        className="h-11 w-52"
        value={filters.sort}
        onValueChange={(v) => update({ sort: v as Sort })}
        options={SORTS.map((s) => ({ value: s.value, label: s.label }))}
      />
    </div>
  )
}
