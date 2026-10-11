import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Lifts on hover/focus-within (for clickable cards). */
  interactive?: boolean
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'group/card relative flex flex-col overflow-hidden rounded-md border border-border bg-surface text-text shadow-sm',
        interactive &&
          'transition-[transform,box-shadow,border-color] duration-(--duration-base) ease-out-expo hover:-translate-y-1 hover:border-border-accent hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg',
        className,
      )}
      {...props}
    />
  )
}

export function CardMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative aspect-[4/3] overflow-hidden bg-bg-subtle [&_img]:transition-transform [&_img]:duration-(--duration-slower) [&_img]:ease-out-expo group-hover/card:[&_img]:scale-[1.04]',
        className,
      )}
      {...props}
    />
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-1 flex-col gap-2 p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-2xl leading-snug', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-text-muted', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between gap-3 border-t border-border px-5 py-4', className)}
      {...props}
    />
  )
}
