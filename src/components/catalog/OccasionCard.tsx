import NextLink from 'next/link'

import type { PublicEventType } from '@/lib/data/types'
import { cn } from '@/lib/cn'

import { MediaImage } from './MediaImage'

/** Tall editorial card: image with a soft scrim, name set in the display serif. */
export function OccasionCard({ event, className, sizes }: { event: PublicEventType; className?: string; sizes: string }) {
  return (
    <NextLink
      href={`/occasions/${event.slug}`}
      data-cursor="view"
      className={cn(
        'group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-md bg-bg-subtle',
        'focus-visible:outline-offset-4',
        className,
      )}
    >
      <MediaImage
        image={event.image}
        sizes={sizes}
        className="transition-transform duration-(--duration-slower) ease-out-expo group-hover:scale-[1.05]"
      />
      {/* Scrim uses the dark theme's background so text contrast holds in both site themes. */}
      <div
        aria-hidden="true"
        data-theme="dark"
        className="absolute inset-0 !bg-transparent bg-[linear-gradient(to_top,var(--color-bg)_8%,transparent_65%)] opacity-90"
      />
      <div data-theme="dark" className="relative flex flex-col gap-1 !bg-transparent p-5">
        <h3 className="text-3xl leading-tight">{event.name.replace(/\s*\(.*\)$/, '')}</h3>
        {event.tagline && <p className="text-sm text-text-muted">{event.tagline}</p>}
      </div>
    </NextLink>
  )
}
