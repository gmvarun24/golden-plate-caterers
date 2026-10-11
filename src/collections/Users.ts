import type { CollectionConfig } from 'payload'

import { hasRole, isAdmin, isOwner, isOwnerField, isOwnerOrSelf, ROLES } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
  },
  auth: true,
  access: {
    // Only logged-in admins can see the user list; nothing is public.
    read: isAdmin,
    create: isOwner,
    update: isOwnerOrSelf,
    delete: isOwner,
    // Anyone may reach /admin; access is enforced per collection.
    admin: ({ req }) => hasRole(req.user, 'owner', 'staff'),
  },
  hooks: {
    beforeChange: [
      // The very first account created becomes the owner, so a fresh install is usable.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
          req,
        })
        if (totalDocs === 0) return { ...data, role: 'owner' }
        return data
      },
    ],
  },
  fields: [
    // Email & password are added by `auth: true`
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', admin: { description: 'Used when assigning enquiries.' } },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      saveToJWT: true,
      options: ROLES.map((role) => ({
        label: role === 'owner' ? 'Owner (everything)' : 'Staff (enquiries & packages)',
        value: role,
      })),
      access: {
        // Only owners may grant or change roles (the first-user hook bypasses this).
        create: isOwnerField,
        update: isOwnerField,
      },
      admin: {
        position: 'sidebar',
        description:
          'Owners see vendor identities and cost prices; staff never do. The first account is always an owner.',
      },
    },
  ],
}
