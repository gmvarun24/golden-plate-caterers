import 'server-only'

import config from '@payload-config'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { getPayload } from 'payload'

import { getBrand } from '@/lib/brand/get-brand'
import { getEventTypes, getPackage } from '@/lib/data/catalog'
import { getSiteContent } from '@/lib/data/site'
import { serverEnv } from '@/lib/env'
import { getEmailProvider } from '@/lib/notify/email'
import { adminEnquiryEmail, customerConfirmationEmail, type EnquiryEmailData } from '@/lib/notify/templates'
import { getWhatsAppNotifier } from '@/lib/notify/whatsapp'
import { enquirySchema, selectionSchema, sourceSchema } from '@/lib/validation/enquiry'
import { formatIndianMobile, normalizeIndianMobile } from '@/lib/validation/phone'

import { checkRateLimit, clientIp, clientKey } from './rate-limit'
import { generateToken, quoteSlug } from './reference'
import { nextReferenceId } from './sequence'
import { buildSnapshot, type QuoteSnapshotV1 } from './snapshot'

export type SubmitResult =
  | { ok: true; referenceId: string; path: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const GENERIC_ERROR = 'Something went wrong while sending your enquiry. Please try again, or call us.'

const dateLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(`${iso}T12:00:00+05:30`))

/**
 * Creates an enquiry. Trusts nothing from the client:
 *   validates with the shared Zod schema, checks the honeypot and rate limit, reloads the
 *   package on the server, recomputes every price, allocates the reference ID atomically,
 *   then saves a frozen snapshot. Notifications run after the response is sent.
 */
export async function submitEnquiry(raw: unknown): Promise<SubmitResult> {
  const body = (raw ?? {}) as { enquiry?: unknown; selection?: unknown; source?: unknown }

  const parsed = enquirySchema.safeParse(body.enquiry)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      fieldErrors[key] ??= issue.message
    }
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors }
  }
  const data = parsed.data

  // Honeypot: bots fill every field. Pretend nothing happened (no signal to the bot).
  if (data.website && data.website.trim() !== '') return { ok: false, error: GENERIC_ERROR }

  const payload = await getPayload({ config })
  const hdrs = await headers()
  const allowed = await checkRateLimit(payload, clientKey(clientIp(hdrs), serverEnv.RATE_LIMIT_SALT))
  if (!allowed) return { ok: false, error: 'You’ve sent several enquiries in a short time. Please call or WhatsApp us instead.' }

  const [brand, site, events] = await Promise.all([getBrand(), getSiteContent(), getEventTypes()])

  // Package enquiry: recompute everything from server-side data.
  let snapshot: QuoteSnapshotV1 | null = null
  let packageSlug: string | null = null
  if (body.selection) {
    const sel = selectionSchema.safeParse(body.selection)
    if (!sel.success) return { ok: false, error: 'Your menu selection could not be read. Please refresh and try again.' }
    const pkg = await getPackage(sel.data.packageSlug)
    if (!pkg) return { ok: false, error: 'This menu is no longer available. Please choose another or send a general enquiry.' }
    const built = buildSnapshot(pkg, { guests: data.guests, items: sel.data.items, addOnIds: sel.data.addOnIds }, site.pricingDisclaimer)
    if (!built.ok) return { ok: false, error: `Your menu needs attention: ${built.reason}`, fieldErrors: { guests: built.reason } }
    snapshot = built.snapshot
    packageSlug = pkg.slug
  }

  const source = sourceSchema.safeParse(body.source ?? {})
  const event = events.find((e) => e.slug === data.eventType) ?? null
  const phoneE164 = normalizeIndianMobile(data.phone)!

  const [eventTypeDoc, packageDoc] = await Promise.all([
    event ? payload.find({ collection: 'event-types', where: { slug: { equals: event.slug } }, limit: 1, depth: 0, overrideAccess: true }) : null,
    packageSlug ? payload.find({ collection: 'packages', where: { slug: { equals: packageSlug } }, limit: 1, depth: 0, select: { slug: true }, overrideAccess: true }) : null,
  ])

  const token = generateToken()
  let referenceId = ''
  let enquiryId: number | null = null
  // The counter is atomic; a retry only guards against a manually-edited counter colliding.
  for (let attempt = 0; attempt < 3 && enquiryId === null; attempt++) {
    referenceId = await nextReferenceId(payload, brand.referencePrefix)
    try {
      const doc = await payload.create({
        collection: 'enquiries',
        overrideAccess: true,
        data: {
          referenceId,
          accessToken: token,
          status: 'new',
          customerName: data.name,
          phoneE164,
          email: data.email || undefined,
          eventType: eventTypeDoc?.docs[0]?.id,
          eventDate: `${data.eventDate}T12:00:00+05:30`,
          guestCount: data.guests,
          area: data.area,
          notes: data.notes || undefined,
          package: packageDoc?.docs[0]?.id,
          snapshot: snapshot as unknown as Record<string, unknown> | null,
          estimatedTotal: snapshot?.total,
          consent: true,
          consentAt: new Date().toISOString(),
          source: source.success ? source.data : {},
        },
      })
      enquiryId = doc.id
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!/unique|duplicate/i.test(message)) {
        console.error('[enquiry] create failed', error)
        return { ok: false, error: GENERIC_ERROR }
      }
    }
  }
  if (enquiryId === null) return { ok: false, error: GENERIC_ERROR }

  const path = `/q/${quoteSlug(referenceId, token)}`
  const siteUrl = serverEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const emailData: EnquiryEmailData = {
    brandName: brand.name,
    referenceId,
    quoteUrl: `${siteUrl}${path}`,
    adminUrl: `${siteUrl}/admin/collections/enquiries/${enquiryId}`,
    customerName: data.name,
    phone: formatIndianMobile(phoneE164),
    email: data.email || undefined,
    eventType: event?.name,
    eventDate: dateLabel(data.eventDate),
    area: data.area,
    guests: data.guests,
    notes: data.notes || undefined,
    snapshot,
    hoursText: brand.hours.map((h) => `${h.days}: ${h.hours}`).join(' · '),
    brandPhone: brand.contact.phone,
  }

  // Notifications never block or fail the enquiry.
  after(async () => {
    const mailer = getEmailProvider()
    const jobs: Promise<unknown>[] = []
    const adminTo = serverEnv.ADMIN_NOTIFY_EMAIL || brand.contact.email
    const admin = adminEnquiryEmail(emailData)
    jobs.push(mailer.send({ to: adminTo, ...admin, replyTo: emailData.email }))
    if (emailData.email) jobs.push(mailer.send({ to: emailData.email, ...customerConfirmationEmail(emailData) }))
    jobs.push(
      getWhatsAppNotifier().notify(
        `New enquiry ${referenceId}: ${data.name}, ${emailData.phone}. ${event?.name ?? 'Event'} on ${emailData.eventDate}, ${data.guests} guests, ${data.area}.${snapshot ? ` ${snapshot.package.title}, est. ₹${snapshot.total.toLocaleString('en-IN')}.` : ''} ${emailData.adminUrl}`,
      ),
    )
    const results = await Promise.allSettled(jobs)
    for (const r of results) if (r.status === 'rejected') console.error('[enquiry] notification failed', r.reason)
  })

  return { ok: true, referenceId, path }
}
