'use client'

import { useState, type KeyboardEvent } from 'react'

import { cn } from '@/lib/cn'

import { useField } from './Field'
import { MinusIcon, PlusIcon } from './icons'

type StepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Larger jump for PageUp/PageDown and Shift+Arrow. */
  bigStep?: number
  /** Unit read by screen readers, e.g. "guests". */
  unit?: string
  className?: string
  disabled?: boolean
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** Number stepper (guest count). Typing is allowed; the value is clamped on blur. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  bigStep = step * 10,
  unit,
  className,
  disabled,
}: StepperProps) {
  const field = useField()
  const [draft, setDraft] = useState(String(value))
  // Keep the typed draft in sync when the value changes from outside (adjust state during render).
  const [syncedValue, setSyncedValue] = useState(value)
  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(String(value))
  }

  const commit = (n: number) => {
    const next = clamp(Number.isFinite(n) ? Math.round(n) : value, min, max)
    onChange(next)
    setDraft(String(next))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const jump = e.shiftKey ? bigStep : step
    const keys: Record<string, () => number> = {
      ArrowUp: () => value + jump,
      ArrowDown: () => value - jump,
      PageUp: () => value + bigStep,
      PageDown: () => value - bigStep,
      Home: () => min,
      End: () => max,
    }
    const action = keys[e.key]
    if (action) {
      e.preventDefault()
      commit(action())
    }
    if (e.key === 'Enter') commit(Number(draft))
  }

  const buttonClass = cn(
    'grid size-12 shrink-0 place-items-center text-text transition-colors duration-(--duration-fast)',
    'hover:bg-accent-soft hover:text-accent disabled:pointer-events-none disabled:opacity-35',
  )

  return (
    <div
      className={cn(
        'inline-flex h-12 items-stretch overflow-hidden rounded-full border border-border-input bg-surface',
        'has-[:focus-visible]:border-focus-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus-ring/30',
        field?.invalid && 'border-danger',
        className,
      )}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => commit(value - step)}
        disabled={disabled || value <= min}
        aria-label={`Decrease${unit ? ` ${unit}` : ''}`}
        tabIndex={-1}
      >
        <MinusIcon className="size-5" />
      </button>
      <input
        id={field?.id}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max === Number.MAX_SAFE_INTEGER ? undefined : max}
        aria-valuenow={value}
        aria-valuetext={unit ? `${value} ${unit}` : undefined}
        inputMode="numeric"
        disabled={disabled}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={() => commit(Number(draft))}
        onKeyDown={onKeyDown}
        data-cursor="text"
        className="w-20 bg-transparent text-center text-lg font-medium text-text tabular outline-none"
      />
      <button
        type="button"
        className={buttonClass}
        onClick={() => commit(value + step)}
        disabled={disabled || value >= max}
        aria-label={`Increase${unit ? ` ${unit}` : ''}`}
        tabIndex={-1}
      >
        <PlusIcon className="size-5" />
      </button>
    </div>
  )
}
