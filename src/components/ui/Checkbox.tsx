'use client'

import { Checkbox as RadixCheckbox } from 'radix-ui'
import { useId, type ComponentProps, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

import styles from './Checkbox.module.css'

type CheckboxProps = ComponentProps<typeof RadixCheckbox.Root>

/** Square checkbox whose tick draws itself in. */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      className={cn(
        'peer inline-grid size-5 shrink-0 place-items-center rounded-xs border-[1.5px] border-border-input bg-surface text-on-accent',
        'transition-[background-color,border-color] duration-(--duration-fast) ease-standard',
        'hover:border-accent data-[state=checked]:border-accent-fill data-[state=checked]:bg-accent-fill',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator forceMount className={styles.indicator}>
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
          <path className={styles.tick} d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
}

type CheckboxCardProps = Omit<CheckboxProps, 'children' | 'title'> & {
  title: ReactNode
  description?: ReactNode
  /** Right-aligned meta, e.g. a price. */
  meta?: ReactNode
  media?: ReactNode
}

/** A whole card that toggles — used for add-ons and menu items. */
export function CheckboxCard({ title, description, meta, media, className, id, ...props }: CheckboxCardProps) {
  const autoId = useId()
  const cbId = id ?? `cb-${autoId}`
  return (
    <label
      htmlFor={cbId}
      data-cursor="pointer"
      className={cn(
        'group relative flex cursor-pointer items-start gap-4 rounded-md border border-border bg-surface p-4',
        'transition-[border-color,box-shadow,background-color] duration-(--duration-base) ease-standard',
        'hover:border-border-accent has-[[data-state=checked]]:border-accent-fill has-[[data-state=checked]]:bg-accent-soft/40 has-[[data-state=checked]]:shadow-md',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus-ring',
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55',
        className,
      )}
    >
      <Checkbox id={cbId} className="mt-0.5 focus-visible:outline-none" {...props} />
      {media}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-medium text-text">{title}</span>
        {description && <span className="text-sm text-text-muted">{description}</span>}
      </span>
      {meta && <span className="shrink-0 text-sm font-medium text-text tabular">{meta}</span>}
    </label>
  )
}
