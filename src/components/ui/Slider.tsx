'use client'

import { Slider as RadixSlider } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

type SliderProps = ComponentProps<typeof RadixSlider.Root> & {
  /** Accessible names for each thumb, e.g. ["Minimum price", "Maximum price"]. */
  thumbLabels: string[]
  /** Spoken value for each thumb, e.g. (v) => `₹${v} per plate`. */
  formatValue?: (value: number) => string
}

/** Range / single slider. Thumbs are 24px for comfortable touch; full keyboard support from Radix. */
export function Slider({ className, thumbLabels, formatValue, value, defaultValue, ...props }: SliderProps) {
  const values = value ?? defaultValue ?? []
  return (
    <RadixSlider.Root
      value={value}
      defaultValue={defaultValue}
      className={cn('relative flex h-11 w-full touch-none items-center select-none', className)}
      {...props}
    >
      <RadixSlider.Track className="relative h-1 grow overflow-hidden rounded-full bg-border-strong">
        <RadixSlider.Range className="absolute h-full bg-accent-fill" />
      </RadixSlider.Track>
      {values.map((v, i) => (
        <RadixSlider.Thumb
          key={i}
          aria-label={thumbLabels[i]}
          aria-valuetext={formatValue?.(v)}
          data-cursor="drag"
          className={cn(
            'block size-6 rounded-full border-2 border-accent-fill bg-surface-raised shadow-md',
            'transition-transform duration-(--duration-fast) ease-standard hover:scale-110 active:scale-95',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          )}
        />
      ))}
    </RadixSlider.Root>
  )
}
