'use client'

import { useState } from 'react'

import { MediaImage } from '@/components/catalog/MediaImage'
import type { PublicImage } from '@/lib/data/types'
import { cn } from '@/lib/cn'

/** Main image + thumbnails. Thumbnails are buttons (keyboard accessible). */
export function Gallery({ images, title }: { images: PublicImage[]; title: string }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? null
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-bg-subtle">
        <MediaImage image={current} variant="hero" sizes="(min-width: 1024px) 55vw, 100vw" priority />
      </div>
      {images.length > 1 && (
        <ul className="flex gap-3" aria-label={`${title} photos`}>
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-pressed={i === active}
                className={cn(
                  'relative block size-20 overflow-hidden rounded-sm border-2 transition-[border-color,opacity]',
                  i === active ? 'border-accent-fill' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <MediaImage image={img} variant="thumb" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
