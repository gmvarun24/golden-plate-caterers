import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-normal whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-bg-subtle text-text',
        accent: 'bg-accent-soft text-accent',
        secondary: 'bg-secondary-fill text-on-secondary',
        outline: 'border border-border-strong text-text-muted',
        premium: 'bg-gradient-gold text-on-accent',
        danger: 'bg-danger text-on-danger',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export type Diet = 'veg' | 'non-veg' | 'jain' | 'mixed'

const DIET_LABEL: Record<Diet, string> = {
  veg: 'Veg',
  'non-veg': 'Non-veg',
  jain: 'Jain',
  mixed: 'Veg & non-veg',
}

/** FSSAI-style mark: a square outline with a dot (veg) or a triangle (non-veg). */
export function DietMark({ diet, className }: { diet: Exclude<Diet, 'mixed'>; className?: string }) {
  const color =
    diet === 'veg' ? 'text-diet-veg' : diet === 'jain' ? 'text-diet-jain' : 'text-diet-nonveg'
  return (
    <svg viewBox="0 0 16 16" className={cn('size-[1.1em] shrink-0', color, className)} aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {diet === 'non-veg' ? (
        <path d="M8 4.2 12 11H4z" fill="currentColor" />
      ) : (
        <circle cx="8" cy="8" r="3.4" fill="currentColor" />
      )}
    </svg>
  )
}

export function DietTag({ diet, className, showLabel = true }: { diet: Diet; className?: string; showLabel?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text',
        className,
      )}
    >
      {diet === 'mixed' ? (
        <>
          <DietMark diet="veg" />
          <DietMark diet="non-veg" />
        </>
      ) : (
        <DietMark diet={diet} />
      )}
      {showLabel ? DIET_LABEL[diet] : <span className="sr-only">{DIET_LABEL[diet]}</span>}
    </span>
  )
}
