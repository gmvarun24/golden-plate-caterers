import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, lead }: { eyebrow: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <header className="flex max-w-3xl flex-col gap-4">
      <p className="eyebrow text-accent">{eyebrow}</p>
      <h1 className="text-5xl leading-tight tracking-display text-balance">{title}</h1>
      {lead && <p className="text-lg text-text-muted">{lead}</p>}
    </header>
  )
}

/** Long-form text pages (privacy, terms). */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-prose text-text-muted [&_a]:text-accent [&_a]:underline [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:text-text [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:text-text [&_li]:mb-2 [&_p]:mb-4 [&_strong]:text-text [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  )
}

/** Visible banner for placeholder legal text. */
export function ReviewNotice() {
  return (
    <div role="note" className="max-w-prose rounded-md border border-warning bg-accent-soft p-4 text-sm text-text">
      <strong>Placeholder — legal review required.</strong> This text is a starting point written with India&rsquo;s
      Digital Personal Data Protection Act, 2023 in mind. Have it reviewed by a qualified lawyer before launch.
    </div>
  )
}
