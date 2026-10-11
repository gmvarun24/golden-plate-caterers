import type { Metadata } from 'next'
import NextLink from 'next/link'

import { PackageCard } from '@/components/catalog/PackageCard'
import { ClearFilters } from '@/components/menus/ClearFilters'
import { FilterPanel } from '@/components/menus/FilterPanel'
import { FiltersProvider, ResultsRegion } from '@/components/menus/FiltersContext'
import { MobileFilters } from '@/components/menus/MobileFilters'
import { SortSelect } from '@/components/menus/SortSelect'
import { LogoMark } from '@/components/brand/Logo'
import { buttonVariants } from '@/components/ui/Button'
import { activeFilterCount, applyFilters, parseFilters, priceBounds } from '@/lib/catalog/filters'
import { getCuisines, getEventTypes, getPackageCards } from '@/lib/data/catalog'
import { formatINRNumber } from '@/lib/format/currency'

export const metadata: Metadata = {
  title: 'Catering Menus & Packages',
  description:
    'Browse veg, Jain and non-veg catering menus for weddings, receptions, Gruhapravesha, birthdays and corporate events. Filter by budget per plate and guest count.',
  alternates: { canonical: '/menus' },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function MenusPage({ searchParams }: Props) {
  const [params, cards, events, cuisines] = await Promise.all([searchParams, getPackageCards(), getEventTypes(), getCuisines()])
  const filters = parseFilters(params)
  const results = applyFilters([...cards], filters)
  const bounds = priceBounds(cards)
  const active = activeFilterCount(filters)
  const occasionName = events.find((e) => e.slug === filters.occasion)?.name

  const panel = (prefix: string) => (
    <FilterPanel idPrefix={prefix} occasions={events.map((e) => ({ slug: e.slug, name: e.name }))} cuisines={cuisines} bounds={bounds} />
  )

  return (
    <FiltersProvider initial={filters}>
      <div className="container-wide flex flex-col gap-10 pt-12 pb-(--spacing-section) md:pt-16">
        <header className="flex flex-col gap-4">
          <p className="eyebrow text-accent">Menus & packages</p>
          <h1 className="text-5xl leading-tight tracking-display">
            {occasionName ? (
              <>
                Menus for <em className="text-accent-display italic">{occasionName.replace(/\s*\(.*\)$/, '')}</em>
              </>
            ) : (
              <>
                Find your <em className="text-accent-display italic">menu</em>
              </>
            )}
          </h1>
          <p className="max-w-2xl text-lg text-text-muted">
            Every menu can be customised dish by dish. Prices are per plate and drop as your guest list grows.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-12">
          <aside aria-label="Filters" className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 flex flex-col gap-4">
              {panel('desktop')}
              {active > 0 && (
                <div className="border-t border-border pt-4">
                  <ClearFilters />
                </div>
              )}
            </div>
          </aside>

          <section aria-labelledby="results-title" className="flex flex-col gap-6 lg:col-span-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="results-title" className="font-body text-base font-medium tracking-normal" aria-live="polite">
                {results.length} {results.length === 1 ? 'menu' : 'menus'}
                {filters.guests ? ` for ${formatINRNumber(filters.guests)} guests` : ''}
              </h2>
              <div className="flex items-center gap-3">
                <MobileFilters activeCount={active} resultCount={results.length}>
                  <div className="flex flex-col gap-6">
                    <div className="sm:hidden">
                      <SortSelect />
                    </div>
                    {panel('mobile')}
                  </div>
                </MobileFilters>
                <div className="hidden sm:block">
                  <SortSelect />
                </div>
              </div>
            </div>

            <ResultsRegion>
              {results.length > 0 ? (
                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((p, i) => (
                    <li key={p.slug}>
                      <PackageCard pkg={p} guests={filters.guests} priority={i < 2} headingLevel="h3" />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-5 rounded-lg border border-dashed border-border-strong px-6 py-16 text-center">
                  <LogoMark className="size-16 opacity-70" />
                  <h3 className="text-3xl">Nothing on this plate yet</h3>
                  <p className="max-w-md text-text-muted">
                    No menus match all of these filters. Try widening your budget or guest count — or tell us what you
                    need and we&rsquo;ll put a menu together.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <ClearFilters variant="secondary" />
                    <NextLink href="/contact" className={buttonVariants()}>
                      Ask for a custom menu
                    </NextLink>
                  </div>
                </div>
              )}
            </ResultsRegion>
          </section>
        </div>
      </div>
    </FiltersProvider>
  )
}
