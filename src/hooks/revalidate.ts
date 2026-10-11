import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const CATALOG_TAG = 'catalog'

const expire = (tag: string) => {
  try {
    revalidateTag(tag, { expire: 0 })
  } catch {
    /* outside Next.js (seed script, CLI) — nothing cached to clear */
  }
}

/** Clears cached public catalogue data whenever catalogue content changes. */
export const revalidateCatalogAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  expire(CATALOG_TAG)
  return doc
}

export const revalidateCatalogAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  expire(CATALOG_TAG)
  return doc
}

export const catalogHooks = {
  afterChange: [revalidateCatalogAfterChange],
  afterDelete: [revalidateCatalogAfterDelete],
}
