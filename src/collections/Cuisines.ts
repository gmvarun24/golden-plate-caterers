import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { catalogHooks } from '@/hooks/revalidate'

export const Cuisines: CollectionConfig = {
  slug: 'cuisines',
  defaultSort: 'displayOrder',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'displayOrder'], group: 'Catalogue' },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: catalogHooks,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'displayOrder', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    slugField('name'),
  ],
}
