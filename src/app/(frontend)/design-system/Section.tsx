import type { ReactNode } from 'react'

export function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-24 flex-col gap-8">
      <div className="flex flex-col gap-3 border-t border-border-accent pt-6">
        <h2 id={`${id}-title`} className="text-4xl">
          {title}
        </h2>
        {lead && <p className="max-w-prose text-text-muted">{lead}</p>}
      </div>
      {children}
    </section>
  )
}
