import { cn } from '@/lib/cn'

/** Loader in the brand motif: a plate rim with a travelling highlight arc. */
export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn('inline-flex', className)}>
      <svg viewBox="0 0 24 24" className="size-[1.1em] animate-spin-slow" aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".25" />
        <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}
