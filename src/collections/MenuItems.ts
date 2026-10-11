import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { DISH_DIETS, DIET_LABELS } from '@/lib/catalog/constants'
import { catalogHooks } from '@/hooks/revalidate'

/**
 * The dish library. Packages place dishes into sections and may override the premium flag,
 * surcharge and default selection per section (see DECISIONS.md).
 */
export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  labels: { singular: 'Dish', plural: 'Dishes' },
  defaultSort: 'name',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'diet', 'cuisine', 'isPremium', 'surchargePerPlate'],
    group: 'Catalogue',
    description: 'Reusable dishes. Add them to package sections from the package editor.',
    listSearchableFields: ['name', 'description'],
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: catalogHooks,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'diet',
          type: 'select',
          required: true,
          defaultValue: 'veg',
          options: DISH_DIETS.map((value) => ({ value, label: DIET_LABELS[value] })),
        },
        {
          name: 'spiceLevel',
          type: 'select',
          defaultValue: '1',
          options: [
            { value: '0', label: 'Not spicy' },
            { value: '1', label: 'Mild' },
            { value: '2', label: 'Medium' },
            { value: '3', label: 'Hot' },
          ],
        },
        { name: 'cuisine', type: 'relationship', relationTo: 'cuisines' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        {
          name: 'isPremium',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Default for new sections; packages can override.' },
        },
        {
          name: 'surchargePerPlate',
          label: 'Premium surcharge / plate (₹)',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: { condition: (_, s) => Boolean(s?.isPremium) },
        },
        { name: 'defaultSelected', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
