import type { CollectionConfig, PayloadHandler } from 'payload'

import { hasRole, isAdmin, isOwner } from '@/access/roles'
import { ENQUIRY_STATUSES } from '@/lib/catalog/constants'
import { toCsv } from '@/lib/enquiry/csv'
import { isSnapshotV1 } from '@/lib/enquiry/snapshot'

/** GET /api/enquiries/export.csv[?status=new] — admins only. No vendor or cost data. */
const exportCsv: PayloadHandler = async (req) => {
  if (!hasRole(req.user, 'owner', 'staff')) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url ?? '', 'http://local')
  const status = url.searchParams.get('status')
  const { docs } = await req.payload.find({
    collection: 'enquiries',
    where: status && ENQUIRY_STATUSES.some((s) => s.value === status) ? { status: { equals: status } } : {},
    sort: '-createdAt',
    limit: 10_000,
    depth: 1,
    overrideAccess: true,
    req,
  })
  const name = (v: unknown) => (v && typeof v === 'object' && 'name' in v ? String((v as { name: unknown }).name) : '')
  const rows = docs.map((e) => [
    e.referenceId,
    e.status,
    e.createdAt,
    e.customerName,
    e.phoneE164,
    e.email,
    name(e.eventType),
    e.eventDate?.slice(0, 10),
    e.area,
    e.guestCount,
    isSnapshotV1(e.snapshot) ? e.snapshot.package.title : '',
    e.estimatedTotal,
    name(e.assignedTo),
    e.source?.utmSource,
    e.source?.utmCampaign,
    e.internalNotes,
  ])
  const csv = toCsv(
    ['Reference', 'Status', 'Created', 'Name', 'Phone', 'Email', 'Occasion', 'Event date', 'Area', 'Guests', 'Menu', 'Estimate (INR)', 'Assigned to', 'UTM source', 'UTM campaign', 'Internal notes'],
    rows,
  )
  const date = new Date().toISOString().slice(0, 10)
  return new Response(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="enquiries-${status ?? 'all'}-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * Customer enquiries. Created only by the server (enquiry action, Phase 4) with a generated
 * reference ID and a frozen price snapshot; admins update status, notes and assignment.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'referenceId',
    defaultColumns: ['referenceId', 'customerName', 'phoneE164', 'eventType', 'eventDate', 'guestCount', 'status', 'createdAt'],
    // Search box matches reference ID and phone number (plus name).
    listSearchableFields: ['referenceId', 'phoneE164', 'customerName'],
    group: 'Enquiries',
    pagination: { defaultLimit: 50 },
    components: { beforeListTable: ['@/components/admin/ExportCsvButton#ExportCsvButton'] },
  },
  endpoints: [{ path: '/export.csv', method: 'get', handler: exportCsv }],
  access: {
    read: isAdmin,
    create: () => false, // only via the server action (overrideAccess)
    update: isAdmin,
    delete: isOwner,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'referenceId',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { readOnly: true, width: '40%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          index: true,
          options: [...ENQUIRY_STATUSES],
        },
      ],
    },
    {
      name: 'accessToken',
      type: 'text',
      required: true,
      admin: { readOnly: true, hidden: true },
      access: { read: ({ req }) => hasRole(req.user, 'owner', 'staff') },
    },
    {
      type: 'collapsible',
      label: 'Customer',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'customerName', type: 'text', required: true },
            {
              name: 'phoneE164',
              label: 'Phone',
              type: 'text',
              required: true,
              index: true,
              admin: { description: 'Stored as +91XXXXXXXXXX.' },
            },
            { name: 'email', type: 'email' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'consent', type: 'checkbox', required: true, admin: { readOnly: true } },
            { name: 'consentAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Event',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'eventType', type: 'relationship', relationTo: 'event-types' },
            { name: 'eventDate', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } } },
            { name: 'guestCount', type: 'number', min: 1 },
          ],
        },
        { name: 'area', label: 'Area / locality', type: 'text' },
        { name: 'notes', label: 'Customer notes', type: 'textarea', admin: { readOnly: true } },
      ],
    },
    {
      type: 'collapsible',
      label: 'Quote',
      fields: [
        { name: 'package', type: 'relationship', relationTo: 'packages', admin: { readOnly: true } },
        { name: 'estimatedTotal', label: 'Estimated total (₹)', type: 'number', admin: { readOnly: true } },
        {
          name: 'snapshot',
          type: 'json',
          admin: {
            readOnly: true,
            description: 'Frozen copy of the menu, add-ons and price lines at submission. Never changes.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Source',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'source',
          type: 'group',
          admin: { readOnly: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'utmSource', type: 'text' },
                { name: 'utmMedium', type: 'text' },
                { name: 'utmCampaign', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'utmTerm', type: 'text' },
                { name: 'utmContent', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'referrer', type: 'text' },
                { name: 'landingPath', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar: internal workflow
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    { name: 'internalNotes', type: 'textarea', admin: { position: 'sidebar', description: 'Never shown to the customer.' } },
  ],
}
