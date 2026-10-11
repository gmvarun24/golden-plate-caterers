import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { ADDON_CATEGORIES } from '@/lib/catalog/constants'
import { catalogHooks } from '@/hooks/revalidate'

export const AddOns: CollectionConfig = {
  slug: 'add-ons',
  labels: { singular: 'Add-on', plural: 'Add-ons' },
  defaultSort: 'category',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'pricingType', 'price', 'isGlobal'],
    group: 'Catalogue',
    description: 'Extras such as live counters, staff and decor. "Global" add-ons are offered with every package.',
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: catalogHooks,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        {
          name: 'pricingType',
          type: 'select',
          required: true,
          defaultValue: 'per_plate',
          options: [
            { value: 'per_plate', label: 'Per plate' },
            { value: 'flat', label: 'Flat (per event)' },
          ],
        },
        { name: 'price', label: 'Price (₹)', type: 'number', required: true, min: 0 },
        { name: 'category', type: 'select', required: true, defaultValue: 'other', options: [...ADDON_CATEGORIES] },
      ],
    },
    {
      name: 'isGlobal',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Offer with every package.' },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
