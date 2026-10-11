import type { ReactNode } from 'react'

import { PageTransition } from '@/components/motion/PageTransition'

/** Templates remount on every navigation — the hook for route transitions. */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
