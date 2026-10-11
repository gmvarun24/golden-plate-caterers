import 'server-only'

import config from '@payload-config'
import { cached } from '@/lib/cache'
import { getPayload } from 'payload'

import { DEFAULT_PRICING_DISCLAIMER, SITE_SETTINGS_TAG } from '@/globals/SiteSettings'

import { toImage } from './catalog'
import type { PublicImage } from './types'

export type SiteContent = {
  hero: { eyebrow: string; headline: string; subheadline: string; image: PublicImage | null }
  whyChooseUs: { title: string; body: string }[]
  finalCta: { headline: string; body: string }
  faq: { question: string; answer: string }[]
  testimonials: { quote: string; name: string; occasion: string; area: string }[]
  seo: { title: string | null; description: string | null; imageUrl: string | null }
  pricingDisclaimer: string
}

const DEFAULTS: SiteContent = {
  hero: {
    eyebrow: 'Event catering',
    headline: 'Every occasion, served *in gold*.',
    subheadline:
      'From Gruhapravesha breakfasts to wedding receptions for a thousand — curated menus you can shape plate by plate, with a live price as you go.',
    image: null,
  },
  whyChooseUs: [],
  finalCta: {
    headline: 'Let’s plan your menu *together*.',
    body: 'Call, WhatsApp or send an enquiry — we reply within one business day.',
  },
  faq: [],
  testimonials: [],
  seo: { title: null, description: null, imageUrl: null },
  pricingDisclaimer: DEFAULT_PRICING_DISCLAIMER,
}

const text = (v: string | null | undefined, fallback: string) => (v && v.trim() ? v : fallback)

const load = cached(
  async (): Promise<SiteContent> => {
    const payload = await getPayload({ config })
    const g = await payload.findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: true })
    const image = g.seo?.image && typeof g.seo.image === 'object' ? (g.seo.image.url ?? null) : null
    return {
      hero: {
        eyebrow: text(g.hero?.eyebrow, DEFAULTS.hero.eyebrow),
        headline: text(g.hero?.headline, DEFAULTS.hero.headline),
        subheadline: text(g.hero?.subheadline, DEFAULTS.hero.subheadline),
        image: toImage(g.hero?.image),
      },
      whyChooseUs: (g.whyChooseUs ?? []).map(({ title, body }) => ({ title, body })),
      finalCta: {
        headline: text(g.finalCta?.headline, DEFAULTS.finalCta.headline),
        body: text(g.finalCta?.body, DEFAULTS.finalCta.body),
      },
      faq: (g.faq ?? []).map(({ question, answer }) => ({ question, answer })),
      testimonials: (g.testimonials ?? []).map((t) => ({
        quote: t.quote,
        name: t.name,
        occasion: t.occasion ?? '',
        area: t.area ?? '',
      })),
      seo: { title: g.seo?.title ?? null, description: g.seo?.description ?? null, imageUrl: image },
      pricingDisclaimer: text(g.pricingDisclaimer, DEFAULTS.pricingDisclaimer),
    }
  },
  ['site-content'],
  { tags: [SITE_SETTINGS_TAG], revalidate: 3600 },
)

export async function getSiteContent(): Promise<SiteContent> {
  try {
    return await load()
  } catch (error) {
    console.error('[site] Falling back to defaults:', error)
    return DEFAULTS
  }
}
