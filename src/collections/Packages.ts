import type { CollectionConfig } from 'payload'

import { isAdmin, isOwnerField } from '@/access/roles'
import { priceTiersField } from '@/fields/price-tiers'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { DIETS, DIET_LABELS } from '@/lib/catalog/constants'
import { catalogHooks } from '@/hooks/revalidate'

type SectionRule = { min?: number | null; max?: number | null }
type SectionRow = { title?: string; rule?: SectionRule; items?: unknown[] | null }

export const Packages: CollectionConfig = {
  slug: 'packages',
  defaultSort: '-featured',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'diet', 'minGuests', 'maxGuests', 'featured', 'published'],
    group: 'Catalogue',
    listSearchableFields: ['title', 'shortDescription'],
    description: 'Menus customers can browse and customise.',
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: catalogHooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'diet',
                  type: 'select',
                  required: true,
                  options: DIETS.map((value) => ({ value, label: DIET_LABELS[value] })),
                },
                { name: 'eventTypes', type: 'relationship', relationTo: 'event-types', hasMany: true, required: true },
                { name: 'cuisines', type: 'relationship', relationTo: 'cuisines', hasMany: true, required: true },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              required: true,
              maxLength: 220,
              admin: { description: 'One or two sentences for cards and search results.' },
            },
            { name: 'description', type: 'richText' },
            { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'minGuests', type: 'number', required: true, min: 1 },
                { name: 'maxGuests', type: 'number', required: true, min: 1 },
              ],
            },
            priceTiersField,
            {
              name: 'costPricePerPlate',
              label: 'Cost price / plate (₹) — owner only',
              type: 'number',
              min: 0,
              // Owners only: staff never see or change cost prices.
              access: { read: isOwnerField, create: isOwnerField, update: isOwnerField },
              admin: { description: 'What we pay the partner. Never shown publicly or to staff.' },
            },
          ],
        },
        {
          label: 'Menu',
          fields: [
            {
              name: 'sections',
              type: 'array',
              required: true,
              minRows: 1,
              labels: { singular: 'Section', plural: 'Sections' },
              admin: {
                description: 'Drag to reorder. Each section has a selection rule, e.g. "choose 3 of 8".',
                components: { RowLabel: '@/components/admin/SectionRowLabel#SectionRowLabel' },
              },
              validate: (value) => {
                for (const s of (value ?? []) as SectionRow[]) {
                  const count = s.items?.length ?? 0
                  const min = s.rule?.min ?? 0
                  const max = s.rule?.max ?? 0
                  if (min > max) return `"${s.title}": minimum choices cannot exceed maximum.`
                  if (max > count) return `"${s.title}": allows ${max} choices but only has ${count} dishes.`
                }
                return true
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, admin: { placeholder: 'Starters' } },
                    {
                      name: 'rule',
                      type: 'group',
                      label: 'Selection rule',
                      fields: [
                        {
                          type: 'row',
                          fields: [
                            { name: 'min', label: 'Choose at least', type: 'number', required: true, min: 0, defaultValue: 1 },
                            { name: 'max', label: 'Choose at most', type: 'number', required: true, min: 1, defaultValue: 1 },
                          ],
                        },
                      ],
                    },
                  ],
                },
                { name: 'description', type: 'text' },
                {
                  name: 'items',
                  type: 'array',
                  required: true,
                  minRows: 1,
                  labels: { singular: 'Dish', plural: 'Dishes' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'menuItem', label: 'Dish', type: 'relationship', relationTo: 'menu-items', required: true },
                        {
                          name: 'premium',
                          type: 'select',
                          defaultValue: 'inherit',
                          options: [
                            { value: 'inherit', label: "Use dish's default" },
                            { value: 'standard', label: 'Standard' },
                            { value: 'premium', label: 'Premium' },
                          ],
                        },
                        {
                          name: 'surchargePerPlate',
                          label: 'Surcharge / plate (₹)',
                          type: 'number',
                          min: 0,
                          admin: { description: "Empty = dish's default.", condition: (_, s) => s?.premium !== 'standard' },
                        },
                        {
                          name: 'defaultSelected',
                          type: 'select',
                          defaultValue: 'inherit',
                          options: [
                            { value: 'inherit', label: "Use dish's default" },
                            { value: 'yes', label: 'Pre-selected' },
                            { value: 'no', label: 'Not pre-selected' },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Add-ons',
          fields: [
            {
              name: 'addOns',
              type: 'array',
              labels: { singular: 'Add-on', plural: 'Add-ons' },
              admin: { description: 'Package-specific add-ons. Global add-ons are offered automatically.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'addOn', type: 'relationship', relationTo: 'add-ons', required: true },
                    {
                      name: 'priceOverride',
                      label: 'Price override (₹)',
                      type: 'number',
                      min: 0,
                      admin: { description: "Empty = add-on's standard price." },
                    },
                  ],
                },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField('title'),
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      // Owners only. Staff never see which partner prepares a package.
      access: { read: isOwnerField, create: isOwnerField, update: isOwnerField },
      admin: { position: 'sidebar', description: 'Internal. Never shown publicly or to staff.' },
    },
    { name: 'published', type: 'checkbox', defaultValue: false, index: true, admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true, admin: { position: 'sidebar' } },
    {
      name: 'popularity',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Higher shows first when sorting by popularity.' },
    },
  ],
}
