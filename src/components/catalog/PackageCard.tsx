import NextLink from 'next/link'

import { Tilt } from '@/components/motion/Tilt'
import { Badge, DietTag } from '@/components/ui/Badge'
import { Card, CardBody, CardDescription, CardFooter, CardMedia } from '@/components/ui/Card'
import { ArrowRightIcon } from '@/components/ui/icons'
import { Price } from '@/components/ui/Price'
import type { PublicPackageCard } from '@/lib/data/types'
import { formatINRNumber } from '@/lib/format/currency'
import { pricePerPlateFor } from '@/lib/pricing/tiers'

import { MediaImage } from './MediaImage'

type Props = {
  pkg: PublicPackageCard
  /** When the visitor has entered a guest count, show the price for that count. */
  guests?: number | null
  priority?: boolean
  headingLevel?: 'h2' | 'h3'
}

export function PackageCard({ pkg, guests, priority, headingLevel = 'h3' }: Props) {
  const Heading = headingLevel
  const atGuests = guests ? pricePerPlateFor(pkg.tiers, guests) : null
  return (
    <Tilt>
      <Card interactive data-cursor="view" className="h-full">
        <CardMedia>
          <MediaImage
            image={pkg.image}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            priority={priority}
          />
          {pkg.featured && (
            <Badge variant="premium" className="absolute top-3 left-3 shadow-sm">
              Featured
            </Badge>
          )}
        </CardMedia>
        <CardBody className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DietTag diet={pkg.diet} />
            {pkg.cuisines.slice(0, 2).map((c) => (
              <Badge key={c.slug} variant="outline">
                {c.name}
              </Badge>
            ))}
          </div>
          <Heading className="text-2xl leading-snug">
            <NextLink
              href={`/menus/${pkg.slug}`}
              className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none"
            >
              {pkg.title}
            </NextLink>
          </Heading>
          <CardDescription className="line-clamp-3">{pkg.shortDescription}</CardDescription>
        </CardBody>
        <CardFooter>
          <div className="flex flex-col">
            {atGuests ? (
              <Price amount={atGuests} per="plate" prefix={`for ${formatINRNumber(guests!)} guests`} />
            ) : (
              <Price amount={pkg.priceFrom} per="plate" prefix="from" />
            )}
            <span className="text-xs text-text-muted">
              {formatINRNumber(pkg.minGuests)}–{formatINRNumber(pkg.maxGuests)} guests
            </span>
          </div>
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full border border-border text-text-muted transition-[transform,color,border-color] duration-(--duration-base) ease-out-expo group-hover/card:translate-x-1 group-hover/card:border-accent group-hover/card:text-accent"
          >
            <ArrowRightIcon className="size-4" />
          </span>
        </CardFooter>
      </Card>
    </Tilt>
  )
}
