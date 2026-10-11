import type { Metadata } from 'next'

import { OccasionCard } from '@/components/catalog/OccasionCard'
import { getEventTypes } from '@/lib/data/catalog'

export const metadata: Metadata = {
  title: 'Occasions We Cater',
  description: 'Catering for weddings, receptions, Gruhapravesha, naming ceremonies, birthdays, anniversaries, parties and corporate events.',
  alternates: { canonical: '/occasions' },
}

export default async function OccasionsPage() {
  const events = await getEventTypes()
  return (
    <div className="container-wide flex flex-col gap-12 pt-12 pb-(--spacing-section) md:pt-16">
      <header className="flex max-w-3xl flex-col gap-4">
        <p className="eyebrow text-accent">Occasions</p>
        <h1 className="text-5xl leading-tight tracking-display">
          Whatever you&rsquo;re <em className="text-accent-display italic">celebrating</em>
        </h1>
        <p className="text-lg text-text-muted">Pick an occasion to see menus planned around it — with prices for your guest count.</p>
      </header>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => (
          <li key={e.slug}>
            <OccasionCard event={e} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" className={i === 0 ? 'lg:aspect-[3/4]' : undefined} />
          </li>
        ))}
      </ul>
    </div>
  )
}
