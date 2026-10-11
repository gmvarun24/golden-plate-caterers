import type { CollectionConfig } from 'payload'

/**
 * Fixed-window rate-limit counters, keyed by a salted hash of the client IP + scope.
 * Raw IPs are never stored. Updated atomically in SQL (src/lib/enquiry/rate-limit.ts).
 */
export const RateLimits: CollectionConfig = {
  slug: 'rate-limits',
  admin: { hidden: true },
  access: { read: () => false, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'windowStart', type: 'date', required: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
  ],
}
