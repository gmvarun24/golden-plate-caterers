import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CopyReference } from '@/components/quote/CopyReference'
import { PrintButton } from '@/components/quote/PrintButton'
import { TrackedLink } from '@/components/quote/TrackedLink'
import { DietMark } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { EmailMenu } from '@/components/ui/EmailMenu'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'
import { getBrand } from '@/lib/brand/get-brand'
import { cn } from '@/lib/cn'
import { telHref, whatsappHref } from '@/lib/contact'
import { getQuote } from '@/lib/data/quote'
import { serverEnv } from '@/lib/env'
import { formatINR, formatINRNumber } from '@/lib/format/currency'

type Props = { params: Promise<{ slug: string }> }

// Private, per-customer pages: never indexed, never cached as static.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Your quote',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

const longDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(iso)) : null

export default async function QuotePage({ params }: Props) {
  const { slug } = await params
  const [quote, brand] = await Promise.all([getQuote(slug), getBrand()])
  if (!quote) notFound()

  const url = `${serverEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/q/${slug}`
  const date = longDate(quote.eventDate)
  const occasion = quote.eventType?.replace(/\s*\(.*\)$/, '') ?? 'Event'
  const summary = [occasion, quote.guests ? `${formatINRNumber(quote.guests)} guests` : null, date].filter(Boolean).join(', ')
  const s = quote.snapshot

  const waText = `Hi ${brand.name}, I'd like to discuss quote ${quote.referenceId} — ${summary}. ${url}`
  const mailSubject = `Quote ${quote.referenceId} – ${[occasion, date].filter(Boolean).join(', ')}`
  const mailBody = `Hello ${brand.name},\n\nI'd like to discuss my quote ${quote.referenceId} (${summary}).\n\n${url}\n\nThank you,\n${quote.firstName}`

  return (
    <div className="container-content flex flex-col gap-12 pt-12 pb-(--spacing-section) md:pt-16 print:pt-0">
      <header className="flex flex-col gap-6">
        <p className="eyebrow text-accent">{quote.firstName ? `Thank you, ${quote.firstName}` : 'Thank you'}</p>
        <h1 className="text-4xl leading-tight tracking-display">Your enquiry is with us.</h1>
        <div className="flex flex-col gap-3 rounded-lg border border-border-accent bg-surface p-6 shadow-md sm:p-8">
          <span className="text-sm text-text-muted">Your reference</span>
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-display text-5xl tracking-wide tabular select-all" aria-label={`Reference ${quote.referenceId.split('').join(' ')}`}>
              {quote.referenceId}
            </p>
            <CopyReference referenceId={quote.referenceId} />
          </div>
          <p className="text-sm text-text-muted">
            Keep this handy — mention it when you call or message us. We’ll call {quote.maskedPhone} within one business day.
          </p>
        </div>
      </header>

      <section aria-labelledby="contact-title" className="no-print flex flex-col gap-5">
        <h2 id="contact-title" className="text-3xl">
          Talk to us now
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <TrackedLink
            event="whatsapp_click"
            href={whatsappHref(brand.contact.whatsapp, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'leaf', size: 'lg' }), 'w-full')}
          >
            <WhatsAppIcon /> WhatsApp
          </TrackedLink>
          <TrackedLink event="call_click" href={telHref(brand.contact.phone)} className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
            <PhoneIcon /> Call
          </TrackedLink>
          <EmailMenu
            email={brand.contact.email}
            subject={mailSubject}
            body={mailBody}
            trackParams={{ location: 'quote' }}
            className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'w-full')}
          >
            <MailIcon /> Email
          </EmailMenu>
        </div>
        <p className="text-sm text-text-muted">
          Calling? Please mention your reference <strong className="text-text tabular">{quote.referenceId}</strong>.{' '}
          {brand.hours.map((h) => `${h.days}: ${h.hours}`).join(' · ')}
        </p>
      </section>

      <section aria-labelledby="details-title" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-accent pb-3">
          <h2 id="details-title" className="text-3xl">
            {s ? s.package.title : 'Your enquiry'}
          </h2>
          <PrintButton />
        </div>
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {[
            ['Occasion', quote.eventType ?? '—'],
            ['Date', date ?? '—'],
            ['Guests', quote.guests ? formatINRNumber(quote.guests) : '—'],
            ['Area', quote.area || '—'],
            ['Phone', quote.maskedPhone],
            ['Sent', longDate(quote.submittedAt) ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-border pb-2">
              <dt className="text-text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {s ? (
          <>
            <div className="flex flex-col gap-6">
              {s.sections
                .filter((sec) => sec.items.length > 0)
                .map((sec) => (
                  <div key={sec.title} className="break-inside-avoid">
                    <h3 className="mb-2 font-body text-sm font-medium tracking-wide text-text-muted uppercase">{sec.title}</h3>
                    <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                      {sec.items.map((i) => (
                        <li key={i.name} className="flex items-center gap-2">
                          <DietMark diet={i.diet === 'non-veg' ? 'non-veg' : i.diet === 'jain' ? 'jain' : 'veg'} />
                          {i.name}
                          {i.isPremium && i.surchargePerPlate > 0 && (
                            <span className="text-xs text-text-muted">+{formatINR(i.surchargePerPlate)}/plate</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              {s.addOns.length > 0 && (
                <div className="break-inside-avoid">
                  <h3 className="mb-2 font-body text-sm font-medium tracking-wide text-text-muted uppercase">Add-ons</h3>
                  <ul className="flex flex-col gap-1.5">
                    {s.addOns.map((a) => (
                      <li key={a.name}>
                        {a.name}{' '}
                        <span className="text-xs text-text-muted">
                          {a.pricingType === 'per_plate' ? `${formatINR(a.unitPrice)}/plate` : 'flat'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <table className="w-full text-sm">
              <caption className="sr-only">Price breakdown</caption>
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th scope="col" className="py-2 font-normal">Item</th>
                  <th scope="col" className="py-2 text-right font-normal">Rate</th>
                  <th scope="col" className="py-2 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {s.lines.map((l, i) => (
                  <tr key={`${l.label}-${i}`} className="border-b border-border">
                    <td className="py-2.5">{l.kind === 'base' ? `Base menu (${formatINRNumber(s.tier.minGuests)}–${formatINRNumber(s.tier.maxGuests)} guest tier)` : l.label}</td>
                    <td className="py-2.5 text-right text-text-muted tabular">
                      {l.kind === 'addon_flat' ? 'flat' : `${formatINR(l.unitPrice)} × ${formatINRNumber(l.quantity)}`}
                    </td>
                    <td className="py-2.5 text-right font-medium tabular">{formatINR(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={2} className="pt-4 text-left font-display text-2xl font-normal">
                    Indicative total
                    <span className="block font-body text-xs text-text-muted">{formatINR(s.perPlateTotal)} per plate{s.flatTotal ? ` + ${formatINR(s.flatTotal)} flat` : ''}</span>
                  </th>
                  <td className="pt-4 text-right font-display text-4xl tabular">{formatINR(s.total)}</td>
                </tr>
              </tfoot>
            </table>
            <p className="text-sm text-text-muted">{s.disclaimer}</p>
          </>
        ) : (
          <p className="text-text-muted">This is a general enquiry — we’ll suggest menus when we call.</p>
        )}
      </section>

      <p className="hidden text-xs print:block">
        {brand.name} · {brand.contact.phone} · {brand.contact.email} · {url}
      </p>
    </div>
  )
}
