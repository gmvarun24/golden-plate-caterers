import { cn } from '@/lib/cn'

import { MarqueeVelocity } from './MarqueeVelocity'
import styles from './Marquee.module.css'

/**
 * Endless marquee of cuisines and occasions. A CSS animation whose speed (and direction) reacts
 * to scroll velocity via MarqueeVelocity. Stops under prefers-reduced-motion. The duplicate copy is aria-hidden.
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className={styles.row}>
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          className="flex items-center gap-10 font-display text-5xl whitespace-nowrap md:gap-14 md:text-[length:var(--text-display)]"
        >
          <span className={i % 2 ? 'text-accent-display italic' : undefined}>{item}</span>
          <span
            aria-hidden="true"
            className="inline-block size-4 shrink-0 rounded-full border-2 border-accent-fill md:size-6"
          />
        </li>
      ))}
    </ul>
  )
  return (
    <div className={cn('relative overflow-hidden border-y border-border py-8 md:py-10', className)}>
      <MarqueeVelocity>
        <div data-marquee-track className={styles.track}>
          {row(false)}
          {row(true)}
        </div>
      </MarqueeVelocity>
    </div>
  )
}
