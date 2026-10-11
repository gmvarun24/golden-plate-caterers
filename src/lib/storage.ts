import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import type { Plugin } from 'payload'

/**
 * Media storage by env: `STORAGE_DRIVER=local` (default, files in /media), `vercel-blob` (Vercel
 * Blob, token injected by Vercel) or `s3` (AWS S3, Cloudflare R2, MinIO … anything S3-compatible).
 */
export function storagePlugins(): Plugin[] {
  const blobEnabled = process.env.STORAGE_DRIVER === 'vercel-blob'
  if (blobEnabled && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('STORAGE_DRIVER=vercel-blob but missing: BLOB_READ_WRITE_TOKEN')
  // Registered for every driver (disabled unless selected) so the storage fields it adds to
  // `media` exist in every environment and one set of migrations fits all of them.
  const blob = vercelBlobStorage({
    enabled: blobEnabled,
    alwaysInsertFields: true,
    // Media is public: serve straight from the Blob CDN instead of proxying through a function.
    // Uploads stay server-side (no clientUploads) so files are renamed and re-encoded before
    // they are stored — a direct browser upload would publish the original filename first.
    collections: { media: { disablePayloadAccessControl: true } },
    token: blobEnabled ? process.env.BLOB_READ_WRITE_TOKEN : undefined,
  })
  if (process.env.STORAGE_DRIVER !== 's3') return [blob]
  const required = ['S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) throw new Error(`STORAGE_DRIVER=s3 but missing: ${missing.join(', ')}`)
  return [
    blob,
    s3Storage({
      collections: {
        media: process.env.S3_PUBLIC_URL
          ? {
              generateFileURL: ({ filename, prefix }) =>
                [process.env.S3_PUBLIC_URL, prefix, filename].filter(Boolean).join('/'),
            }
          : true,
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: Boolean(process.env.S3_ENDPOINT),
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      },
    }),
  ]
}
