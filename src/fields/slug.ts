import type { FieldHook, TextField } from 'payload'

export const slugify = (input: string): string =>
  input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const fromField =
  (source: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const src = (data?.[source] ?? originalDoc?.[source]) as unknown
    return typeof src === 'string' ? slugify(src) : value
  }

/** URL slug, generated from `source` when left empty. Unique + indexed. */
export const slugField = (source = 'title'): TextField => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  required: true,
  admin: {
    position: 'sidebar',
    description: `Used in the page URL. Leave empty to generate from the ${source}.`,
  },
  hooks: { beforeValidate: [fromField(source)] },
})
