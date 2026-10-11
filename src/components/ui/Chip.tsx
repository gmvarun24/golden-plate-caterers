'use client'

import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

import { CheckIcon } from './icons'

const chipBase =
  'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap'

/** Static label chip (e.g. cuisine). */
export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(chipBase, 'border-border bg-surface text-text', className)} {...props} />
}

type FilterChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  selected: boolean
  onSelectedChange?: (selected: boolean) => void
}

/** Toggleable filter (aria-pressed). The tick draws in when selected. */
export function FilterChip({ selected, onSelectedChange, className, children, onClick, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) onSelectedChange?.(!selected)
      }}
      className={cn(
        chipBase,
        'transition-[background-color,border-color,color] duration-(--duration-fast) ease-standard',
        selected
          ? 'border-accent-fill bg-accent-soft text-text'
          : 'border-border-input bg-transparent text-text hover:border-accent hover:text-accent',
        className,
      )}
      {...props}
    >
      <CheckIcon
        className={cn(
          'size-4 transition-[opacity,transform] duration-(--duration-base) ease-spring-soft',
          selected ? 'scale-100 opacity-100' : '-ml-6 scale-50 opacity-0',
        )}
      />
      {children}
    </button>
  )
}
