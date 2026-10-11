import 'server-only'

import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { formatReference, periodFor } from './reference'

type Drizzle = { execute: (q: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }> }

/**
 * Next reference ID for this month, e.g. GPC-1026-0042.
 * The counter row is upserted and incremented in ONE statement, so concurrent submissions can
 * never receive the same number (Postgres serialises the conflicting row update).
 */
export async function nextReferenceId(payload: Payload, prefix: string, now = new Date()): Promise<string> {
  const period = periodFor(now)
  const db = (payload.db as unknown as { drizzle: Drizzle }).drizzle
  const result = await db.execute(sql`
    INSERT INTO enquiry_counters (period, value, updated_at, created_at)
    VALUES (${period}, 1, now(), now())
    ON CONFLICT (period) DO UPDATE
      SET value = enquiry_counters.value + 1, updated_at = now()
    RETURNING value
  `)
  const value = Number(result.rows[0]?.value)
  if (!Number.isInteger(value) || value < 1) throw new Error('Could not allocate an enquiry reference number')
  return formatReference(prefix, period, value)
}
