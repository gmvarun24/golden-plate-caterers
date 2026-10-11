/**
 * Reference IDs: PREFIX-MMYY-NNNN (e.g. GPC-1026-0042), month in India time. The sequence number
 * comes from an atomic database counter (see sequence.ts); these helpers are pure.
 */
import { randomInt, timingSafeEqual } from 'node:crypto'

/** "MMYY" for the given instant in Asia/Kolkata. */
export function periodFor(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', month: '2-digit', year: '2-digit' }).formatToParts(date)
  const month = parts.find((p) => p.type === 'month')!.value
  const year = parts.find((p) => p.type === 'year')!.value
  return `${month}${year}`
}

/** Pads to 4 digits; grows naturally past 9,999 in a month. */
export function formatReference(prefix: string, period: string, sequence: number): string {
  return `${prefix}-${period}-${String(sequence).padStart(4, '0')}`
}

export const REFERENCE_PATTERN = /^[A-Z]{2,5}-\d{4}-\d{4,}$/

/** Unambiguous lowercase alphabet (no 0/o, 1/l/i). 31^6 ≈ 887 million combinations. */
const TOKEN_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
export const TOKEN_LENGTH = 6

export function generateToken(length = TOKEN_LENGTH): string {
  let out = ''
  for (let i = 0; i < length; i++) out += TOKEN_ALPHABET[randomInt(TOKEN_ALPHABET.length)]
  return out
}

/** Public quote path segment: "GPC-1026-0042-k3f9xq". */
export function quoteSlug(referenceId: string, token: string): string {
  return `${referenceId}-${token}`
}

/** Split "GPC-1026-0042-k3f9xq" into reference + token, or null if malformed. */
export function parseQuoteSlug(slug: string): { referenceId: string; token: string } | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    return null
  }
  const i = decoded.lastIndexOf('-')
  if (i < 0) return null
  const referenceId = decoded.slice(0, i).toUpperCase()
  const token = decoded.slice(i + 1).toLowerCase()
  if (!REFERENCE_PATTERN.test(referenceId)) return null
  if (token.length !== TOKEN_LENGTH || [...token].some((c) => !TOKEN_ALPHABET.includes(c))) return null
  return { referenceId, token }
}

/** Constant-time token comparison. */
export function tokensMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}
