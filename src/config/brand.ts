/**
 * Brand defaults — the fallback for every brand value on the site.
 *
 * Admins override any of these from /admin → Globals → Brand Settings (no code change).
 * Code must read the brand through `getBrand()` (src/lib/brand/get-brand.ts), never import
 * this file directly in components, so admin overrides always win.
 */
import { z } from 'zod'

export const socialLinkSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'youtube', 'x', 'linkedin', 'pinterest']),
  url: z.url(),
})

export const businessHoursSchema = z.object({
  /** e.g. "Mon – Sat" */
  days: z.string().min(1),
  /** e.g. "9:00 am – 8:00 pm" */
  hours: z.string().min(1),
})

export const brandSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  tagline: z.string().min(1),
  logo: z.object({
    light: z.string().min(1),
    dark: z.string().min(1),
    mono: z.string().min(1),
    markLight: z.string().min(1),
    markDark: z.string().min(1),
    favicon: z.string().min(1),
  }),
  contact: z.object({
    /** Display format, e.g. "+91 98765 43210" */
    phone: z.string().min(1),
    /** E.164 digits for wa.me, no "+" — e.g. "919876543210" */
    whatsapp: z.string().regex(/^\d{10,15}$/),
    email: z.email(),
  }),
  hours: z.array(businessHoursSchema).min(1),
  address: z.object({
    locality: z.string(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string(),
    country: z.string().length(2),
  }),
  /** Free text shown in footer & contact page */
  serviceArea: z.string().min(1),
  socials: z.array(socialLinkSchema),
  /** Prefix for enquiry reference IDs: PREFIX-MMYY-NNNN */
  referencePrefix: z.string().regex(/^[A-Z]{2,5}$/),
})

export type Brand = z.infer<typeof brandSchema>

export const brandDefaults: Brand = brandSchema.parse({
  name: 'Golden Plate Caterers',
  shortName: 'Golden Plate',
  tagline: 'Every occasion, served in gold.',
  logo: {
    light: '/brand/logo-light.svg',
    dark: '/brand/logo-dark.svg',
    mono: '/brand/logo-mono.svg',
    markLight: '/brand/mark-light.svg',
    markDark: '/brand/mark-dark.svg',
    favicon: '/brand/favicon.svg',
  },
  contact: {
    // Placeholder contact details — replace from Brand Settings before launch.
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    email: 'hello@goldenplatecaterers.in',
  },
  hours: [
    { days: 'Mon – Sat', hours: '9:00 am – 8:00 pm' },
    { days: 'Sunday', hours: '10:00 am – 6:00 pm' },
  ],
  address: {
    locality: 'Indiranagar',
    city: 'Bengaluru',
    region: 'Karnataka',
    postalCode: '560038',
    country: 'IN',
  },
  serviceArea: 'Currently serving Bengaluru & nearby areas',
  socials: [
    { platform: 'instagram', url: 'https://instagram.com/' },
    { platform: 'facebook', url: 'https://facebook.com/' },
  ],
  referencePrefix: 'GPC',
})
