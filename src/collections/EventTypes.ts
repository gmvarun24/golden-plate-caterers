import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { seoField } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { catalogHooks } from '@/hooks/revalidate'

export const EventTypes: CollectionConfig = {
  slug: 'event-types',
  labels: { singular: 'Event type', plural: 'Event types' },
  defaultSort: 'displayOrder',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'displayOrder', 'updatedAt'],
    group: 'Catalogue',
    description: 'Occasions we cater (Wedding, Gruhapravesha…). Each gets a landing page at /occasions/<slug>.',
  },
  // Public pages read through the server-side data layer, never the REST API.
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: catalogHooks,
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'tagline',
      type: 'text',
      admin: { description: 'Short line for cards, e.g. "Bless the new home with a sattvik feast".' },
    },
    { name: 'description', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'displayOrder', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    slugField('name'),
    seoField,
  ],
}
