import Link from 'next/link'

import { LogoMark } from '@/components/brand/Logo'
import { buttonVariants } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-(--spacing-gutter) text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <LogoMark className="size-20" />
        <p className="eyebrow text-text-muted">Error 404</p>
        <h1 className="text-4xl">This plate is empty.</h1>
        <p className="text-text-muted">The page you were looking for has been cleared from the table.</p>
        <Link href="/" className={buttonVariants()}>
          Back to the home page
        </Link>
      </div>
    </main>
  )
}
