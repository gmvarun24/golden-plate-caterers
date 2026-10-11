import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Props = {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  action?: ReactNode
  id?: string
  className?: string
  align?: 'start' | 'center'
}

export function SectionHeading({ eyebrow, title, lead, action, id, className, align = 'start' }: Props) {
  return (
    <div
      data-reveal="fade-up"
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('flex max-w-2xl flex-col gap-4', align === 'center' && 'items-center')}>
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h2 id={id} className="text-5xl leading-tight tracking-display">
          {title}
        </h2>
        {lead && <p className="text-lg text-text-muted">{lead}</p>}
      </div>
      {action}
    </div>
  )
}
