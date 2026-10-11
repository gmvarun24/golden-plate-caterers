import { cn } from '@/lib/cn'
import { formatINR, formatINRCompact } from '@/lib/format/currency'

type PriceProps = {
  /** Whole rupees. */
  amount: number
  /** `plate` appends "/ plate" (read as "per plate"). */
  per?: 'plate'
  /** `compact` → ₹1.5L */
  compact?: boolean
  /** Prefix such as "from". */
  prefix?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'display'
  className?: string
}

const sizes = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-3xl font-display',
  xl: 'text-4xl font-display',
  display: 'text-5xl font-display tracking-tight',
} as const

/** Indian-rupee price with en-IN grouping (₹1,50,000) and tabular numerals. */
export function Price({ amount, per, compact, prefix, size = 'md', className }: PriceProps) {
  const value = compact ? formatINRCompact(amount) : formatINR(amount)
  return (
    <span className={cn('inline-flex items-baseline gap-1.5 text-text tabular', className)}>
      {prefix && <span className="text-sm text-text-muted">{prefix}</span>}
      <span className={cn('font-medium', sizes[size])}>{value}</span>
      {per === 'plate' && (
        <span className="text-sm text-text-muted">
          <span aria-hidden="true">/ plate</span>
          <span className="sr-only">per plate</span>
        </span>
      )}
    </span>
  )
}
