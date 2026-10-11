import 'server-only'

import config from '@payload-config'
import { getPayload } from 'payload'

import { isSnapshotV1, type QuoteSnapshotV1 } from '@/lib/enquiry/snapshot'
import { parseQuoteSlug, tokensMatch } from '@/lib/enquiry/reference'
import { maskPhone } from '@/lib/validation/phone'
import type { EventType } from '@/payload-types'

/** What the public quote page may show: first name only, masked phone, frozen snapshot. */
export type QuoteView = {
  referenceId: string
  firstName: string
  maskedPhone: string
  eventType: string | null
  eventDate: string | null
  area: string
  guests: number | null
  snapshot: QuoteSnapshotV1 | null
  submittedAt: string
}

/** Looks up a quote by its unguessable slug; null for unknown references or wrong tokens. */
export async function getQuote(slug: string): Promise<QuoteView | null> {
  const parsed = parseQuoteSlug(slug)
  if (!parsed) return null
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'enquiries',
    where: { referenceId: { equals: parsed.referenceId } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
    select: {
      referenceId: true,
      accessToken: true,
      customerName: true,
      phoneE164: true,
      eventType: true,
      eventDate: true,
      area: true,
      guestCount: true,
      snapshot: true,
      createdAt: true,
    },
  })
  const e = docs[0]
  if (!e || !e.accessToken || !tokensMatch(e.accessToken, parsed.token)) return null
  const event = e.eventType && typeof e.eventType === 'object' ? (e.eventType as EventType) : null
  return {
    referenceId: e.referenceId,
    firstName: (e.customerName ?? '').trim().split(/\s+/)[0] ?? '',
    maskedPhone: maskPhone(e.phoneE164),
    eventType: event?.name ?? null,
    eventDate: e.eventDate ?? null,
    area: e.area ?? '',
    guests: e.guestCount ?? null,
    snapshot: isSnapshotV1(e.snapshot) ? e.snapshot : null,
    submittedAt: e.createdAt,
  }
}
