import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

import { isOwner } from '@/access/roles'
import { BRAND_CACHE_TAG } from '@/lib/brand/constants'

/**
 * Brand Settings — everything brand-related, editable by the owner without code changes.
 * Empty fields fall back to src/config/brand.ts.
 */
export const BrandSettings: GlobalConfig = {
  slug: 'brand-settings',
  label: 'Brand Settings',
  admin: {
    group: 'Settings',
    description:
      'Name, logo, contact details and hours shown across the public site. Leave a field empty to use the built-in default.',
  },
  access: {
    read: () => true,
    update: isOwner,
  },
  hooks: {
    afterChange: [
      () => {
        // Expire immediately so the next request renders the new brand. Outside a Next.js
        // request (e.g. the seed script) there is no cache to revalidate, so ignore errors.
        try {
          revalidateTag(BRAND_CACHE_TAG, { expire: 0 })
        } catch {
          /* not running inside Next.js */
        }
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { name: 'name', type: 'text', admin: { placeholder: 'Golden Plate Caterers' } },
            {
              name: 'shortName',
              type: 'text',
              admin: { placeholder: 'Golden Plate', description: 'Used in compact spaces.' },
            },
            {
              name: 'tagline',
              type: 'text',
              admin: { placeholder: 'Every occasion, served in gold.' },
            },
            {
              name: 'referencePrefix',
              type: 'text',
              admin: {
                placeholder: 'GPC',
                description:
                  '2–5 capital letters. Used in enquiry reference IDs (e.g. GPC-1026-0042). Changing it only affects new enquiries.',
              },
              validate: (value: string | null | undefined) =>
                !value || /^[A-Z]{2,5}$/.test(value) || 'Use 2–5 capital letters (A–Z).',
            },
          ],
        },
        {
          label: 'Logo',
          description:
            'Optional. Upload SVGs to replace the default logo files in /public/brand. Upload filenames are anonymised automatically.',
          fields: [
            { name: 'logoLight', type: 'upload', relationTo: 'media', label: 'Logo (light theme)' },
            { name: 'logoDark', type: 'upload', relationTo: 'media', label: 'Logo (dark theme)' },
            { name: 'logoMono', type: 'upload', relationTo: 'media', label: 'Logo (monochrome)' },
            { name: 'favicon', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'phone',
              type: 'text',
              admin: { placeholder: '+91 98765 43210', description: 'As it should be displayed.' },
            },
            {
              name: 'whatsapp',
              type: 'text',
              admin: {
                placeholder: '919876543210',
                description: 'Country code + number, digits only (used for wa.me links).',
              },
              validate: (value: string | null | undefined) =>
                !value || /^\d{10,15}$/.test(value) || 'Digits only, including country code (e.g. 919876543210).',
            },
            { name: 'email', type: 'email' },
            {
              name: 'hours',
              type: 'array',
              labels: { singular: 'Hours row', plural: 'Business hours' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'days', type: 'text', required: true, admin: { placeholder: 'Mon – Sat' } },
                    {
                      name: 'hours',
                      type: 'text',
                      required: true,
                      admin: { placeholder: '9:00 am – 8:00 pm' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Location',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'locality', type: 'text', admin: { placeholder: 'Indiranagar' } },
                { name: 'city', type: 'text', admin: { placeholder: 'Bengaluru' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'region', type: 'text', admin: { placeholder: 'Karnataka' } },
                { name: 'postalCode', type: 'text', admin: { placeholder: '560038' } },
              ],
            },
            {
              name: 'serviceArea',
              type: 'textarea',
              admin: { placeholder: 'Currently serving Bengaluru & nearby areas' },
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socials',
              type: 'array',
              labels: { singular: 'Social link', plural: 'Social links' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      options: ['instagram', 'facebook', 'youtube', 'x', 'linkedin', 'pinterest'],
                    },
                    { name: 'url', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
