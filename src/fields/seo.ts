import type { GroupField } from 'payload'

/** Optional per-page SEO overrides; empty fields fall back to sensible defaults. */
export const seoField: GroupField = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  admin: { description: 'Optional. Leave empty to use the defaults generated from the content.' },
  fields: [
    { name: 'title', type: 'text', maxLength: 70 },
    { name: 'description', type: 'textarea', maxLength: 170 },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Social sharing image (1200×630).' } },
  ],
}
