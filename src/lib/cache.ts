import { unstable_cache } from 'next/cache'

/**
 * `unstable_cache` in production; a pass-through in development, so seed runs and direct DB
 * edits show up immediately while working locally. Production caches are cleared by the
 * collection/global `afterChange` hooks (revalidateTag).
 */
export function cached<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  keyParts: string[],
  options: { tags: string[]; revalidate?: number },
): (...args: Args) => Promise<R> {
  return process.env.NODE_ENV === 'production' ? unstable_cache(fn, keyParts, options) : fn
}
