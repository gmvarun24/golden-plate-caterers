import 'server-only'

import config from '@payload-config'
import { cached } from '@/lib/cache'
import { getPayload } from 'payload'

import { brandDefaults, type Brand } from '@/config/brand'

import { BRAND_CACHE_TAG } from './constants'
import { mergeBrand } from './merge-brand'

const loadBrand = cached(
  async (): Promise<Brand> => {
    const payload = await getPayload({ config })
    const global = await payload.findGlobal({ slug: 'brand-settings', depth: 1 })
    return mergeBrand(brandDefaults, global)
  },
  ['brand-settings'],
  { tags: [BRAND_CACHE_TAG], revalidate: 3600 },
)

/** The live brand: Brand Settings global merged over src/config/brand.ts. */
export async function getBrand(): Promise<Brand> {
  try {
    return await loadBrand()
  } catch (error) {
    // Database unreachable: render with defaults rather than failing the page (not cached).
    console.error('[brand] Falling back to defaults:', error)
    return brandDefaults
  }
}
