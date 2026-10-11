import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CollectionBeforeOperationHook, CollectionConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { catalogHooks } from '@/hooks/revalidate'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Replace the uploaded filename with a content hash. Original filenames often carry vendor or
 * photographer names ("sharma-caterers-buffet.jpg") and must never reach the public site.
 */
const anonymiseFilename: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if ((operation !== 'create' && operation !== 'update') || !req.file) return args
  const file = req.file
  const bytes = file.data?.length ? file.data : file.tempFilePath ? await readFile(file.tempFilePath) : null
  if (!bytes) return args
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16)
  const ext = path.extname(file.name).toLowerCase()
  file.name = `gp-${hash}${ext}`
  return args
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description:
      'Images are re-encoded (camera metadata removed) and renamed automatically. Never put vendor names in alt text.',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeOperation: [anonymiseFilename],
    ...catalogHooks,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for screen readers, e.g. "Banana-leaf thali with payasam".' },
    },
  ],
  upload: {
    // Local disk by default; STORAGE_DRIVER=vercel-blob or s3 switches storage (src/lib/storage.ts).
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*'],
    // Re-encoding raster images through sharp drops EXIF/GPS/camera metadata (withMetadata is off).
    formatOptions: { format: 'webp', options: { quality: 86 } },
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 480, height: 480, position: 'centre' },
      { name: 'card', width: 960, height: 720, position: 'centre' },
      { name: 'hero', width: 2400, withoutEnlargement: true },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
  },
}
