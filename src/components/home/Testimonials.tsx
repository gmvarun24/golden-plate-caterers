import { SectionHeading } from './SectionHeading'

type Testimonial = { quote: string; name: string; occasion: string; area: string }

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="testimonials-title" className="py-(--spacing-section)">
      <div className="container-wide flex flex-col gap-14">
        <SectionHeading id="testimonials-title" eyebrow="Kind words" title="From the families we’ve served" />
        <ul className="grid gap-6 md:grid-cols-2">
          {items.map((t) => (
            <li key={t.name}>
              <figure className="flex h-full flex-col justify-between gap-8 rounded-md border border-border bg-surface p-8 shadow-sm">
                <blockquote className="relative font-display text-2xl leading-snug">
                  <span
                    aria-hidden="true"
                    className="absolute -top-6 -left-1 font-display text-5xl leading-none text-accent-fill"
                  >
                    “
                  </span>
                  <p className="relative">{t.quote}</p>
                </blockquote>
                <figcaption className="flex flex-col text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-text-muted">{[t.occasion, t.area].filter(Boolean).join(' · ')}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
