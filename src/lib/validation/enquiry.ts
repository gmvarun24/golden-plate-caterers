/**
 * Enquiry schema — shared by the client form (React Hook Form) and the server action, so both
 * validate identically. The server additionally recomputes all prices.
 */
import { z } from 'zod'

import { normalizeIndianMobile } from './phone'

/** Today's date in India as yyyy-mm-dd. */
export const todayInIndia = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .min(1, 'Please enter your mobile number')
    .refine((v) => normalizeIndianMobile(v) !== null, 'Enter a valid 10-digit Indian mobile number'),
  email: z.union([z.literal(''), z.email('Enter a valid email address').max(120)]).optional(),
  eventType: z.string().trim().max(60).optional(),
  /** yyyy-mm-dd (India date) */
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose your event date')
    .refine((d) => d >= todayInIndia(), 'The event date can’t be in the past'),
  area: z.string().trim().min(2, 'Which area or locality is the event in?').max(80),
  guests: z.coerce
    .number({ error: 'Enter the number of guests' })
    .int('Whole numbers only')
    .min(10, 'At least 10 guests')
    .max(10_000, 'Please call us for events this large'),
  notes: z.string().trim().max(1000, 'Please keep notes under 1,000 characters').optional(),
  consent: z.literal(true, { error: 'Please agree so we can contact you about your enquiry' }),
  /** Honeypot — real people never see or fill it. */
  website: z.string().optional(),
})

export type EnquiryInput = z.input<typeof enquirySchema>
export type EnquiryData = z.output<typeof enquirySchema>

/** The customiser selection sent with a package enquiry (ids only — prices are recomputed). */
export const selectionSchema = z.object({
  packageSlug: z.string().regex(/^[a-z0-9-]{1,100}$/),
  items: z.record(z.string().max(64), z.array(z.string().max(64)).max(50)),
  addOnIds: z.array(z.string().max(64)).max(50),
})

export type SelectionInput = z.infer<typeof selectionSchema>

export const sourceSchema = z
  .object({
    utmSource: z.string().max(100),
    utmMedium: z.string().max(100),
    utmCampaign: z.string().max(100),
    utmTerm: z.string().max(100),
    utmContent: z.string().max(100),
    referrer: z.string().max(300),
    landingPath: z.string().max(300),
  })
  .partial()

export type SourceInput = z.infer<typeof sourceSchema>
