import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

/** Loading placeholder with a soft gold shimmer (static under reduced motion). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-md bg-bg-subtle bg-[linear-gradient(100deg,transparent_30%,var(--color-accent-soft)_50%,transparent_70%)] bg-[length:200%_100%] motion-ok:animate-shimmer',
        className,
      )}
      {...props}
    />
  )
}
