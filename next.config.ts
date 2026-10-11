import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/** Allow media served from an S3-compatible bucket / CDN (STORAGE_DRIVER=s3) or Vercel Blob. */
const remoteMedia = [
  ...(process.env.S3_PUBLIC_URL ? [new URL(`${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/**`)] : []),
  ...(process.env.STORAGE_DRIVER === 'vercel-blob'
    ? [{ protocol: 'https' as const, hostname: '*.public.blob.vercel-storage.com', pathname: '/**' }]
    : []),
]

/** Baseline security headers for every response (admin included). */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  // `NEXT_OUTPUT=standalone` (set in the Dockerfile) produces a self-contained server for a VPS.
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  // A separate build dir lets the e2e suite run a production build next to your dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  experimental: {
    // Our CSS is small atomic Tailwind (~18 KB): inlining removes the render-blocking request on first visit.
    inlineCss: true,
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Private quote pages: never indexed, never stored by shared caches.
      {
        source: '/q/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
      { source: '/design-system', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/brand/**' }],
    remotePatterns: remoteMedia,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
