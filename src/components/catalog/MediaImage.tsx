import Image from 'next/image'

import type { PublicImage } from '@/lib/data/types'
import { cn } from '@/lib/cn'

type Variant = 'thumb' | 'card' | 'hero' | 'original'

type Props = {
  image: PublicImage | null
  /** Which pre-generated size to use as the source (next/image still optimises it). */
  variant?: Variant
  /** CSS `sizes` hint — keep it accurate so phones download small files. */
  sizes: string
  priority?: boolean
  className?: string
  /** Fill the parent (parent must be positioned with an aspect ratio). */
  fill?: boolean
}

/** next/image for Payload media: respects the focal point and falls back to a soft placeholder. */
export function MediaImage({ image, variant = 'card', sizes, priority, className, fill = true }: Props) {
  if (!image) {
    return <div aria-hidden="true" className={cn('size-full bg-bg-subtle', className)} />
  }
  const src = (variant !== 'original' && image.sizes[variant]) || { url: image.url, width: image.width, height: image.height }
  const common = {
    src: src.url,
    sizes,
    priority,
    className: cn('object-cover', className),
    style: { objectPosition: `${image.focalX}% ${image.focalY}%` },
  }
  return fill ? (
    <Image {...common} alt={image.alt} fill />
  ) : (
    <Image {...common} alt={image.alt} width={src.width} height={src.height} />
  )
}
