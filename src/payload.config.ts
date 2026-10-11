import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { AddOns } from './collections/AddOns'
import { Cuisines } from './collections/Cuisines'
import { Enquiries } from './collections/Enquiries'
import { EnquiryCounters } from './collections/EnquiryCounters'
import { EventTypes } from './collections/EventTypes'
import { Media } from './collections/Media'
import { MenuItems } from './collections/MenuItems'
import { Packages } from './collections/Packages'
import { RateLimits } from './collections/RateLimits'
import { Users } from './collections/Users'
import { Vendors } from './collections/Vendors'
import { BrandSettings } from './globals/BrandSettings'
import { SiteSettings } from './globals/SiteSettings'
import { serverEnv } from './lib/env'
import { storagePlugins } from './lib/storage'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL: serverEnv.NEXT_PUBLIC_SITE_URL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · Golden Plate Admin',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/brand/favicon.svg' }],
      robots: 'noindex, nofollow',
    },
    components: {
      beforeDashboard: ['@/components/admin/EnquiryDashboard#EnquiryDashboard'],
      graphics: {
        Logo: '@/components/brand/AdminGraphics#AdminLogo',
        Icon: '@/components/brand/AdminGraphics#AdminIcon',
      },
    },
  },
  collections: [Enquiries, Packages, MenuItems, AddOns, EventTypes, Cuisines, Media, Vendors, Users, EnquiryCounters, RateLimits],
  globals: [SiteSettings, BrandSettings],
  editor: lexicalEditor(),
  secret: serverEnv.PAYLOAD_SECRET,
  // The public site reads data through a server-only data layer, never GraphQL.
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: serverEnv.DATABASE_URL },
    // Dev uses schema push. Production: run `npm run migrate` as a deploy step (never at build/boot).
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  telemetry: false,
  plugins: [...storagePlugins()],
})
