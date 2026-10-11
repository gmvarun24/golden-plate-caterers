import type { CollectionConfig } from 'payload'

/**
 * One row per month (period "MMYY") holding the last issued enquiry sequence number.
 * Incremented atomically in SQL by the reference-ID generator (Phase 4). System-only.
 */
export const EnquiryCounters: CollectionConfig = {
  slug: 'enquiry-counters',
  admin: { hidden: true },
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'period', type: 'text', required: true, unique: true, index: true },
    { name: 'value', type: 'number', required: true, defaultValue: 0 },
  ],
}
