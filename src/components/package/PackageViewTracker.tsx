'use client'

import { useEffect } from 'react'

import { track } from '@/lib/analytics'

export function PackageViewTracker({ slug }: { slug: string }) {
  useEffect(() => track('package_view', { package: slug }), [slug])
  return null
}
