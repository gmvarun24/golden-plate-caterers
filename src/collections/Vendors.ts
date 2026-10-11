import type { CollectionConfig } from 'payload'

import { hasRole, isOwner } from '@/access/roles'

/**
 * Partner caterers. INTERNAL ONLY — never exposed publicly, and invisible to staff.
 * The public brand is always Golden Plate.
 */
export const Vendors: CollectionConfig = {
  slug: 'vendors',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'name', 'contactPerson', 'phone', 'active'],
    group: 'Internal (owner only)',
    hidden: ({ user }) => !hasRole(user, 'owner'),
    description: 'Partner caterers. Visible to owners only; never shown on the public site.',
    listSearchableFields: ['code', 'name', 'contactPerson', 'phone'],
  },
  access: {
    read: isOwner,
    create: isOwner,
    update: isOwner,
    delete: isOwner,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'code',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { placeholder: 'V07', width: '30%' },
          validate: (v: string | null | undefined) => (v && /^V\d{2,4}$/.test(v)) || 'Format: V followed by 2–4 digits (e.g. V07).',
        },
        { name: 'name', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'contactPerson', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
      ],
    },
    { name: 'notes', type: 'textarea' },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
