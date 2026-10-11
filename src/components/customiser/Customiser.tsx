'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { MediaImage } from '@/components/catalog/MediaImage'
import { SpiceLevel } from '@/components/package/SpiceLevel'
import { AnimatedPrice } from '@/components/ui/AnimatedPrice'
import { Badge, DietMark } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckboxCard } from '@/components/ui/Checkbox'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field } from '@/components/ui/Field'
import { CheckIcon } from '@/components/ui/icons'
import { Drawer } from '@/components/ui/Modal'
import { Stepper } from '@/components/ui/Stepper'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/cn'
import type { PublicPackage } from '@/lib/data/types'
import { formatINR, formatINRNumber } from '@/lib/format/currency'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { calculateQuote, defaultSelection, type QuoteResult, type Selection } from '@/lib/pricing/calculate'
import { safeStorage } from '@/lib/storage.client'

/** Form + validation (React Hook Form, Zod) load when the enquiry drawer first opens. */
const EnquiryForm = dynamic(() => import('@/components/enquiry/EnquiryForm').then((m) => m.EnquiryForm), {
  ssr: false,
  loading: () => <p className="py-10 text-center text-sm text-text-muted">Loading form…</p>,
})
const preloadForm = () => void import('@/components/enquiry/EnquiryForm')

type Props = {
  pkg: PublicPackage
  occasions: { slug: string; name: string }[]
  disclaimer: string
}

type Saved = Selection & { date?: string; v: 1 }

const storageKey = (slug: string) => `gp-selection:${slug}`
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const ruleText = (min: number, max: number, count: number) =>
  min === max ? `Choose ${max} of ${count}` : min === 0 ? `Up to ${max} of ${count}` : `Choose ${min}–${max} of ${count}`

/** Keep only ids that still exist in the package (menus can change between visits). */
function sanitize(pkg: PublicPackage, saved: Saved | null): (Selection & { date?: string }) | null {
  if (!saved || saved.v !== 1) return null
  const items: Record<string, string[]> = {}
  for (const s of pkg.sections) {
    const valid = new Set(s.items.map((i) => i.id))
    items[s.id] = (saved.items?.[s.id] ?? []).filter((id) => valid.has(id)).slice(0, s.max)
  }
  const addOnIds = (saved.addOnIds ?? []).filter((id) => pkg.addOns.some((a) => a.id === id))
  const guests = Math.min(pkg.maxGuests, Math.max(pkg.minGuests, Math.trunc(saved.guests) || pkg.minGuests))
  return { guests, items, addOnIds, date: saved.date }
}

const subscribeNever = () => () => {}

/**
 * Server render (and hydration) use the chef's defaults; right after hydration the inner
 * component remounts with any selection saved on this device. No setState-in-effect needed.
 */
export function Customiser(props: Props) {
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false)
  const initial = hydrated ? sanitize(props.pkg, safeStorage.get<Saved>(storageKey(props.pkg.slug))) : null
  return <CustomiserInner key={hydrated ? 'client' : 'server'} {...props} initial={initial} persist={hydrated} />
}

function CustomiserInner({
  pkg,
  occasions,
  disclaimer,
  initial,
  persist,
}: Props & { initial: (Selection & { date?: string }) | null; persist: boolean }) {
  const [selection, setSelection] = useState<Selection>(() =>
    initial ? { guests: initial.guests, items: initial.items, addOnIds: initial.addOnIds } : defaultSelection(pkg),
  )
  const [date, setDate] = useState<string | undefined>(initial?.date)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 64rem)')
  const tracked = useRef(false)

  // Save the in-progress selection on this device (localStorage, wrapped in try/catch).
  useEffect(() => {
    if (persist) safeStorage.set(storageKey(pkg.slug), { ...selection, date, v: 1 } satisfies Saved)
  }, [selection, date, persist, pkg.slug])

  const quote = useMemo(() => calculateQuote(pkg, selection), [pkg, selection])

  const change = (next: Selection) => {
    setSelection(next)
    if (!tracked.current) {
      tracked.current = true
      track('customise_change', { package: pkg.slug })
    }
  }

  const toggleItem = (sectionId: string, itemId: string, max: number) => {
    const current = selection.items[sectionId] ?? []
    let next: string[]
    if (current.includes(itemId)) next = current.filter((id) => id !== itemId)
    else if (max === 1) next = [itemId] // single choice: swap
    else if (current.length >= max) return
    else next = [...current, itemId]
    change({ ...selection, items: { ...selection.items, [sectionId]: next } })
  }

  const toggleAddOn = (id: string) =>
    change({
      ...selection,
      addOnIds: selection.addOnIds.includes(id) ? selection.addOnIds.filter((a) => a !== id) : [...selection.addOnIds, id],
    })

  const reset = () => {
    safeStorage.remove(storageKey(pkg.slug))
    setSelection(defaultSelection(pkg))
    setDate(undefined)
  }

  const issueBySection = new Map(quote.issues.map((i) => [i.sectionId, i]))

  const summary = (
    <Summary
      quote={quote}
      disclaimer={disclaimer}
      onEnquire={() => {
        setSummaryOpen(false)
        setEnquiryOpen(true)
      }}
      onReset={reset}
    />
  )

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="flex flex-col gap-12 lg:col-span-8">
        {/* Event basics */}
        <fieldset className="grid gap-6 rounded-md border border-border bg-surface p-6 sm:grid-cols-2">
          <legend className="sr-only">Your event</legend>
          <Field
            label="Number of guests"
            required
            hint={`This menu serves ${formatINRNumber(pkg.minGuests)}–${formatINRNumber(pkg.maxGuests)} guests.`}
            error={quote.guestIssue ?? undefined}
          >
            <Stepper
              value={selection.guests}
              onChange={(guests) => change({ ...selection, guests })}
              min={pkg.minGuests}
              max={pkg.maxGuests}
              step={10}
              bigStep={50}
              unit="guests"
            />
          </Field>
          <Field label="Event date" hint="Optional for now — needed when you send the enquiry.">
            <DatePicker value={date ? new Date(`${date}T00:00:00`) : undefined} onChange={(d) => setDate(d ? toIso(d) : undefined)} />
          </Field>
          {quote.tier && (
            <p className="text-sm text-text-muted sm:col-span-2">
              At {formatINRNumber(selection.guests)} guests the base price is{' '}
              <strong className="text-text">{formatINR(quote.tier.pricePerPlate)} per plate</strong>
              {pkg.tiers.length > 1 && ' — it drops as your guest list grows.'}
            </p>
          )}
        </fieldset>

        {/* Sections */}
        {pkg.sections.map((s) => {
          const chosen = selection.items[s.id] ?? []
          const issue = issueBySection.get(s.id)
          const full = s.max > 1 && chosen.length >= s.max
          return (
            <fieldset key={s.id} id={`section-${s.id}`} className="flex scroll-mt-28 flex-col gap-4" aria-describedby={`rule-${s.id}`}>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border-accent pb-3">
                <legend className="font-display text-3xl">{s.title}</legend>
                <div id={`rule-${s.id}`} className="flex items-center gap-2" aria-live="polite">
                  <Badge variant="outline">{ruleText(s.min, s.max, s.items.length)}</Badge>
                  {issue ? (
                    <Badge variant="accent">{issue.message}</Badge>
                  ) : (
                    <Badge variant="secondary">
                      <CheckIcon className="size-3.5" /> Done
                    </Badge>
                  )}
                </div>
              </div>
              {s.description && <p className="text-sm text-text-muted">{s.description}</p>}
              {full && <p className="text-xs text-text-muted">You’ve chosen {s.max}. Remove one to pick another.</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                {s.items.map((item) => {
                  const checked = chosen.includes(item.id)
                  return (
                    <CheckboxCard
                      key={item.id}
                      checked={checked}
                      disabled={!checked && full}
                      onCheckedChange={() => toggleItem(s.id, item.id, s.max)}
                      title={
                        <span className="flex flex-wrap items-center gap-2">
                          <DietMark diet={item.diet} />
                          {item.name}
                          <SpiceLevel level={item.spiceLevel} />
                        </span>
                      }
                      description={item.description}
                      media={
                        item.image ? (
                          <span className="relative -my-1 block size-16 shrink-0 overflow-hidden rounded-sm bg-bg-subtle">
                            <MediaImage image={item.image} variant="thumb" sizes="64px" />
                          </span>
                        ) : undefined
                      }
                      meta={
                        item.isPremium && item.surchargePerPlate > 0 ? (
                          <Badge variant="premium">+{formatINR(item.surchargePerPlate)}/plate</Badge>
                        ) : undefined
                      }
                    />
                  )
                })}
              </div>
            </fieldset>
          )
        })}

        {/* Add-ons */}
        {pkg.addOns.length > 0 && (
          <fieldset className="flex flex-col gap-4">
            <div className="border-b border-border-accent pb-3">
              <legend className="font-display text-3xl">Add-ons</legend>
            </div>
            <p className="text-sm text-text-muted">Optional extras. Per-plate add-ons are charged for every guest.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {pkg.addOns.map((a) => (
                <CheckboxCard
                  key={a.id}
                  checked={selection.addOnIds.includes(a.id)}
                  onCheckedChange={() => toggleAddOn(a.id)}
                  title={a.name}
                  description={a.description}
                  media={
                    a.image ? (
                      <span className="relative -my-1 block size-16 shrink-0 overflow-hidden rounded-sm bg-bg-subtle">
                        <MediaImage image={a.image} variant="thumb" sizes="64px" />
                      </span>
                    ) : undefined
                  }
                  meta={a.pricingType === 'per_plate' ? `${formatINR(a.price)}/plate` : formatINR(a.price)}
                />
              ))}
            </div>
          </fieldset>
        )}
      </div>

      {/* Desktop: sticky side panel */}
      <aside aria-label="Price summary" className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-24">{summary}</div>
      </aside>

      {/* Mobile: total + review button pinned to the bottom, full summary in a sheet */}
      <div className="fixed inset-x-0 bottom-0 z-(--z-sticky) border-t border-border bg-surface-raised/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-overlay backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted">Indicative total</span>
            <AnimatedPrice value={quote.total} className="font-display text-2xl" />
          </div>
          <Drawer
            side="bottom"
            open={summaryOpen && !isDesktop}
            onOpenChange={setSummaryOpen}
            title="Your estimate"
            trigger={<Button>{quote.valid ? 'Review & send' : 'Review'}</Button>}
          >
            {summary}
          </Drawer>
        </div>
      </div>

      <Drawer
        side={isDesktop ? 'right' : 'bottom'}
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
        title="Send your enquiry"
        description={`${pkg.title} · ${formatINRNumber(selection.guests)} guests · indicative ${formatINR(quote.total)}`}
        className="lg:max-w-xl"
      >
        <EnquiryForm
          occasions={occasions}
          defaults={{ eventDate: date ?? '', eventType: pkg.eventTypes[0]?.slug ?? '' }}
          lockedGuests={selection.guests}
          selection={{ packageSlug: pkg.slug, items: selection.items, addOnIds: selection.addOnIds }}
          onSubmitted={() => safeStorage.remove(storageKey(pkg.slug))}
          submitLabel="Send enquiry & get my reference"
        />
      </Drawer>
    </div>
  )
}

function Summary({
  quote,
  disclaimer,
  onEnquire,
  onReset,
}: {
  quote: QuoteResult
  disclaimer: string
  onEnquire: () => void
  onReset: () => void
}) {
  const perPlateLines = quote.lines.filter((l) => l.kind !== 'addon_flat')
  const flatLines = quote.lines.filter((l) => l.kind === 'addon_flat')
  return (
    <div className="flex flex-col gap-5 rounded-md border border-border bg-surface p-6 shadow-md">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl">Your estimate</h2>
        <span className="text-sm text-text-muted tabular">{formatINRNumber(quote.guests)} guests</span>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        {perPlateLines.map((l, i) => (
          <div key={`${l.label}-${i}`} className="flex justify-between gap-4">
            <dt className={cn(l.kind === 'base' ? 'text-text' : 'text-text-muted')}>
              {l.kind === 'base' ? 'Base menu' : l.label}
              <span className="block text-xs text-text-muted tabular">
                {formatINR(l.unitPrice)} × {formatINRNumber(l.quantity)}
              </span>
            </dt>
            <dd className="font-medium tabular">{formatINR(l.amount)}</dd>
          </div>
        ))}
        {flatLines.map((l, i) => (
          <div key={`${l.label}-flat-${i}`} className="flex justify-between gap-4">
            <dt className="text-text-muted">
              {l.label}
              <span className="block text-xs">Flat</span>
            </dt>
            <dd className="font-medium tabular">{formatINR(l.amount)}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-baseline justify-between gap-4 border-t border-border-accent pt-4">
        <span className="text-sm text-text-muted">
          Per plate <span className="tabular">{formatINR(quote.perPlate.total)}</span>
        </span>
        <AnimatedPrice value={quote.total} className="font-display text-4xl" />
      </div>
      <p className="text-xs text-text-muted">{disclaimer}</p>

      {!quote.valid && (
        <ul className="flex flex-col gap-1.5 rounded-sm bg-bg-subtle p-3 text-sm" aria-live="polite">
          {quote.guestIssue && <li>{quote.guestIssue}</li>}
          {quote.issues.map((i) => (
            <li key={i.sectionId}>
              <a href={`#section-${i.sectionId}`} className="underline underline-offset-4 hover:text-accent">
                {i.title}
              </a>
              : {i.message.toLowerCase()}
            </li>
          ))}
        </ul>
      )}

      <Button size="lg" onClick={onEnquire} onPointerEnter={preloadForm} onFocus={preloadForm} disabled={!quote.valid} cursor="magnetic">
        Send enquiry
      </Button>
      <button type="button" onClick={onReset} className="self-center text-xs text-text-muted underline underline-offset-4 hover:text-accent">
        Reset to the chef’s defaults
      </button>
    </div>
  )
}
