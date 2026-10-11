import NextLink from 'next/link'

import { MediaImage } from '@/components/catalog/MediaImage'
import { SplitText } from '@/components/motion/SplitText'
import { buttonVariants } from '@/components/ui/Button'
import { ArrowRightIcon, WhatsAppIcon } from '@/components/ui/icons'
import type { PublicImage } from '@/lib/data/types'
import { cn } from '@/lib/cn'

import { HeroPlate } from './HeroPlate'

type Props = {
  eyebrow: string
  headline: string
  subheadline: string
  image: PublicImage | null
  whatsappHref: string
  stats: { value: string; label: string }[]
}

export function Hero({ eyebrow, headline, subheadline, image, whatsappHref, stats }: Props) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Ambient warm glow behind the plate */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-10%] right-[-25%] size-[70vmax] rounded-full bg-[radial-gradient(closest-side,var(--color-accent-soft),transparent)] opacity-80 lg:right-[-12%]"
      >
        <div className="ambient size-full rounded-full bg-[radial-gradient(closest-side_at_40%_45%,var(--color-accent-soft),transparent)]" />
      </div>
      <div className="container-wide relative grid items-center gap-12 pt-10 pb-16 md:pt-16 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-12 lg:gap-8 lg:py-20">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <p className="reveal-load eyebrow text-accent">{eyebrow}</p>
          <h1 id="hero-title" className="text-display leading-[0.95] tracking-display text-balance">
            <SplitText text={headline} mode="load" />
          </h1>
          <p
            style={{ '--i': 3 } as React.CSSProperties}
            className="reveal-load max-w-xl text-lg text-text-muted md:text-xl"
          >
            {subheadline}
          </p>
          <div style={{ '--i': 4 } as React.CSSProperties} className="reveal-load flex flex-wrap gap-3">
            <NextLink href="/menus" className={buttonVariants({ size: 'lg' })} data-cursor="magnetic">
              Explore menus <ArrowRightIcon />
            </NextLink>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp_click"
              className={buttonVariants({ size: 'lg', variant: 'secondary' })}
            >
              <WhatsAppIcon /> Plan on WhatsApp
            </a>
          </div>
          <dl
            style={{ '--i': 5 } as React.CSSProperties}
            className="reveal-load mt-4 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <dt className="order-2 text-sm text-text-muted">{s.label}</dt>
                <dd className="tabular order-1 font-display text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="reveal-load-scale relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          {/* The gold plate: image in a circle, double rim, highlight arc that sweeps on scroll */}
          <HeroPlate>
            <div data-plate className="relative aspect-square will-change-transform">
              <div className="bg-gradient-gold absolute inset-0 rounded-full p-[3px] shadow-glow">
                <div className="relative size-full overflow-hidden rounded-full bg-bg-subtle">
                  <div data-plate-image className="absolute inset-0 will-change-transform">
                    <MediaImage
                      image={image}
                      variant="hero"
                      sizes="(min-width: 1024px) 40vw, 90vw"
                      priority
                    />
                  </div>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-[6%] rounded-full border border-accent-fill/50"
              />
              <svg
                data-plate-shine
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="absolute inset-0 size-full -rotate-[35deg]"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48.5"
                  fill="none"
                  stroke="var(--color-accent-fill-hover)"
                  strokeWidth=".8"
                  strokeLinecap="round"
                  strokeDasharray="22 400"
                  opacity=".9"
                />
              </svg>
            </div>
          </HeroPlate>
          <p
            className={cn(
              'absolute -bottom-2 left-2 flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-2 text-sm shadow-md sm:left-0',
            )}
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-success" />
            Live price as you customise
          </p>
        </div>
      </div>
    </section>
  )
}
