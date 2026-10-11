'use client'

import { useState } from 'react'

import { FilterChip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Slider } from '@/components/ui/Slider'
import { DIET_FILTERS } from '@/lib/catalog/filters'
import { DIET_LABELS } from '@/lib/catalog/constants'
import type { PublicCuisine, PublicEventRef } from '@/lib/data/types'
import { formatINR } from '@/lib/format/currency'

import { useMenuFilters } from './FiltersContext'

type Props = {
  occasions: PublicEventRef[]
  cuisines: PublicCuisine[]
  bounds: { min: number; max: number }
  idPrefix: string
}

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

function Group({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-border pt-5" aria-labelledby={id}>
      <legend id={id} className="eyebrow float-left mb-3 w-full text-text-muted">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export function FilterPanel({ occasions, cuisines, bounds, idPrefix }: Props) {
  const { filters, update } = useMenuFilters()
  // Local slider/guest state so dragging and typing are smooth; committed to the URL on release / blur.
  const [budget, setBudget] = useState<[number, number]>([filters.min ?? bounds.min, filters.max ?? bounds.max])
  const [guests, setGuests] = useState(filters.guests ? String(filters.guests) : '')
  const [synced, setSynced] = useState(filters)
  if (synced !== filters) {
    setSynced(filters)
    setBudget([filters.min ?? bounds.min, filters.max ?? bounds.max])
    setGuests(filters.guests ? String(filters.guests) : '')
  }

  const commitGuests = () => {
    const n = Number.parseInt(guests, 10)
    const next = Number.isFinite(n) && n > 0 ? n : null
    if (next !== filters.guests) update({ guests: next })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-occasion`} className="eyebrow text-text-muted">
          Occasion
        </label>
        <div>
          <Select
            id={`${idPrefix}-occasion`}
            value={filters.occasion ?? 'any'}
            onValueChange={(v) => update({ occasion: v === 'any' ? null : v })}
            options={[{ value: 'any', label: 'Any occasion' }, ...occasions.map((o) => ({ value: o.slug, label: o.name }))]}
          />
        </div>
      </div>

      <Group title="Diet" id={`${idPrefix}-diet`}>
        <div className="flex flex-wrap gap-2">
          {DIET_FILTERS.map((d) => (
            <FilterChip key={d} selected={filters.diets.includes(d)} onSelectedChange={() => update({ diets: toggle(filters.diets, d) })}>
              {DIET_LABELS[d]}
            </FilterChip>
          ))}
        </div>
      </Group>

      <Group title="Cuisine" id={`${idPrefix}-cuisine`}>
        <div className="flex flex-wrap gap-2">
          {cuisines.map((c) => (
            <FilterChip
              key={c.slug}
              selected={filters.cuisines.includes(c.slug)}
              onSelectedChange={() => update({ cuisines: toggle(filters.cuisines, c.slug) })}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      </Group>

      <Group title="Budget per plate" id={`${idPrefix}-budget`}>
        <p className="flex justify-between text-sm font-medium tabular" aria-live="polite">
          <span>{formatINR(budget[0])}</span>
          <span>{budget[1] >= bounds.max ? `${formatINR(budget[1])}+` : formatINR(budget[1])}</span>
        </p>
        <Slider
          min={bounds.min}
          max={bounds.max}
          step={50}
          minStepsBetweenThumbs={1}
          value={budget}
          onValueChange={(v) => setBudget([v[0]!, v[1]!])}
          onValueCommit={(v) =>
            update({ min: v[0]! <= bounds.min ? null : v[0]!, max: v[1]! >= bounds.max ? null : v[1]! })
          }
          thumbLabels={['Minimum price per plate', 'Maximum price per plate']}
          formatValue={(v) => `${formatINR(v)} per plate`}
        />
      </Group>

      <Group title="Guests" id={`${idPrefix}-guests`}>
        <label htmlFor={`${idPrefix}-guests-input`} className="sr-only">
          Number of guests
        </label>
        <Input
          id={`${idPrefix}-guests-input`}
          inputMode="numeric"
          placeholder="e.g. 250"
          value={guests}
          onChange={(e) => setGuests(e.target.value.replace(/\D/g, '').slice(0, 5))}
          onBlur={commitGuests}
          onKeyDown={(e) => e.key === 'Enter' && commitGuests()}
        />
        <p className="text-xs text-text-muted">Shows menus that serve this many guests, priced for your count.</p>
      </Group>
    </div>
  )
}
