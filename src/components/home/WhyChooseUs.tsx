import { SectionHeading } from './SectionHeading'

export function WhyChooseUs({ items }: { items: { title: string; body: string }[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="why-title" className="bg-bg-subtle py-(--spacing-section)">
      <div className="container-wide grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            id="why-title"
            eyebrow="Why Golden Plate"
            title={
              <>
                Hospitality, <em className="text-accent-display italic">polished</em>
              </>
            }
            lead="We bring the finest kitchens together under one name — and take responsibility for every plate."
          />
        </div>
        <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:col-span-7">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 bg-bg-subtle p-7">
              <dt className="font-display text-2xl">{item.title}</dt>
              <dd className="text-text-muted">{item.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
