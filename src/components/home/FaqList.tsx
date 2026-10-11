import { PlusIcon } from '@/components/ui/icons'

/**
 * FAQ as native <details>/<summary>: keyboard and screen-reader accessible with zero JavaScript.
 * (The Radix-based <Accordion> remains in the UI kit for interactive cases.)
 */
export function FaqList({ items, headingLevel = 'h3' }: { items: { question: string; answer: string }[]; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <div className="border-t border-border">
      {items.map((f) => (
        <details key={f.question} className="group border-b border-border [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-text transition-colors hover:text-accent">
            <Heading className="font-body text-lg font-medium tracking-normal">{f.question}</Heading>
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border transition-[transform,border-color] duration-(--duration-slow) ease-out-expo group-open:rotate-[135deg] group-hover:border-accent"
            >
              <PlusIcon className="size-4" />
            </span>
          </summary>
          <div className="max-w-prose pb-6 text-text-muted group-open:animate-rise-in">
            <p>{f.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
