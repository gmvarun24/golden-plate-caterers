'use client'

import { RadioGroup } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export function RadioCardGroup({ className, ...props }: ComponentProps<typeof RadioGroup.Root>) {
  return <RadioGroup.Root className={cn('grid gap-3', className)} {...props} />
}

type RadioCardProps = Omit<ComponentProps<typeof RadioGroup.Item>, 'children' | 'title'> & {
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
}

/** One option in a RadioCardGroup. Arrow keys move between options (roving focus). */
export function RadioCard({ title, description, meta, className, ...props }: RadioCardProps) {
  return (
    <RadioGroup.Item
      data-cursor="pointer"
      className={cn(
        'group flex w-full items-start gap-4 rounded-md border border-border bg-surface p-4 text-left',
        'transition-[border-color,box-shadow,background-color] duration-(--duration-base) ease-standard',
        'hover:border-border-accent data-[state=checked]:border-accent-fill data-[state=checked]:bg-accent-soft/40 data-[state=checked]:shadow-md',
        'disabled:cursor-not-allowed disabled:opacity-55',
        className,
      )}
      {...props}
    >
      {/* Plate-like radio: a ring that fills with a gold centre. */}
      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-border-input transition-colors group-data-[state=checked]:border-accent-fill">
        <span className="size-2.5 scale-0 rounded-full bg-accent-fill transition-transform duration-(--duration-base) ease-spring-soft group-data-[state=checked]:scale-100" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-medium text-text">{title}</span>
        {description && <span className="text-sm text-text-muted">{description}</span>}
      </span>
      {meta && <span className="shrink-0 text-sm font-medium tabular">{meta}</span>}
    </RadioGroup.Item>
  )
}
