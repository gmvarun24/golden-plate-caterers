import 'server-only'

import { createHash } from 'node:crypto'

import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

type Drizzle = { execute: (q: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }> }

export type RateLimitRule = { scope: string; limit: number; windowSeconds: number }

/** Enquiry limits: a short burst window and a daily cap, per client. */
export const ENQUIRY_LIMITS: RateLimitRule[] = [
  { scope: 'enquiry:10m', limit: 5, windowSeconds: 600 },
  { scope: 'enquiry:1d', limit: 20, windowSeconds: 86_400 },
]

/** Salted SHA-256 of the client IP — the raw address is never stored. */
export function clientKey(ip: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

/** First address in X-Forwarded-For (set by Vercel / the reverse proxy), else X-Real-IP. */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Atomically counts a hit; returns false when any rule is exceeded. */
export async function checkRateLimit(payload: Payload, key: string, rules = ENQUIRY_LIMITS): Promise<boolean> {
  const db = (payload.db as unknown as { drizzle: Drizzle }).drizzle
  for (const rule of rules) {
    const k = `${rule.scope}:${key}`
    const { rows } = await db.execute(sql`
      INSERT INTO rate_limits (key, window_start, count, updated_at, created_at)
      VALUES (${k}, now(), 1, now(), now())
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${rule.windowSeconds})
                     THEN 1 ELSE rate_limits.count + 1 END,
        window_start = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${rule.windowSeconds})
                     THEN now() ELSE rate_limits.window_start END,
        updated_at = now()
      RETURNING count
    `)
    if (Number(rows[0]?.count) > rule.limit) return false
  }
  return true
}
