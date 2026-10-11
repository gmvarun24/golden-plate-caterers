import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

import { isAdmin } from '@/access/roles'

export const SITE_SETTINGS_TAG = 'site-settings'

export const DEFAULT_PRICING_DISCLAIMER = 'Indicative estimate — final price confirmed on call.'

/** Homepage copy, FAQ, testimonials, SEO defaults and the pricing disclaimer. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'Settings' },
  access: { read: isAdmin, update: isAdmin },
  hooks: {
    afterChange: [
      () => {
        try {
          revalidateTag(SITE_SETTINGS_TAG, { expire: 0 })
        } catch {
          /* not running inside Next.js (e.g. seed script) */
        }
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Homepage',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                { name: 'eyebrow', type: 'text', defaultValue: 'Event catering' },
                {
                  name: 'headline',
                  type: 'text',
                  defaultValue: 'Every occasion, served *in gold*.',
                  admin: { description: 'Wrap words in *asterisks* to set them in gold italics.' },
                },
                {
                  name: 'subheadline',
                  type: 'textarea',
                  defaultValue:
                    'From Gruhapravesha breakfasts to wedding receptions for a thousand — curated menus you can shape plate by plate, with a live price as you go.',
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Shown in the round gold plate. Pick a dish that reads well in a circle, e.g. a thali from above. Empty = the first featured menu’s photo.',
                  },
                },
              ],
            },
            {
              name: 'whyChooseUs',
              type: 'array',
              labels: { singular: 'Reason', plural: 'Why choose us' },
              maxRows: 6,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
            {
              name: 'finalCta',
              type: 'group',
              label: 'Final call to action',
              fields: [
                { name: 'headline', type: 'text', defaultValue: 'Let’s plan your menu *together*.' },
                {
                  name: 'body',
                  type: 'textarea',
                  defaultValue: 'Call, WhatsApp or send an enquiry — we reply within one business day.',
                },
              ],
            },
          ],
        },
        {
          label: 'FAQ',
          fields: [
            {
              name: 'faq',
              type: 'array',
              labels: { singular: 'Question', plural: 'FAQ' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Testimonials',
          fields: [
            {
              name: 'testimonials',
              type: 'array',
              fields: [
                { name: 'quote', type: 'textarea', required: true },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      admin: { description: 'First name + initial is enough.' },
                    },
                    { name: 'occasion', type: 'text' },
                    { name: 'area', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO & legal',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'SEO defaults',
              fields: [
                { name: 'title', type: 'text', maxLength: 70 },
                { name: 'description', type: 'textarea', maxLength: 170 },
                { name: 'image', type: 'upload', relationTo: 'media' },
              ],
            },
            {
              name: 'pricingDisclaimer',
              type: 'text',
              defaultValue: DEFAULT_PRICING_DISCLAIMER,
              admin: { description: 'Shown under every price estimate.' },
            },
          ],
        },
      ],
    },
  ],
}
