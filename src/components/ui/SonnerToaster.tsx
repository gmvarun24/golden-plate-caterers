'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

/** Rendered lazily by ToasterHost (see Toaster.tsx). Call `toast()` from './toast'. */
export default function SonnerToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="bottom-center"
      gap={10}
      offset={24}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-md border border-border bg-surface-raised p-4 text-text shadow-overlay font-body sm:w-(--width)',
          title: 'text-sm font-medium',
          description: 'text-sm text-text-muted',
          actionButton: 'ml-auto rounded-full bg-accent-fill px-3 py-1.5 text-xs font-medium text-on-accent',
          cancelButton: 'rounded-full px-3 py-1.5 text-xs text-text-muted',
          success: '[&_[data-icon]]:text-success',
          error: 'border-danger/40 [&_[data-icon]]:text-danger',
          icon: 'mt-0.5',
        },
      }}
      style={{ zIndex: 'var(--z-toast)' } as React.CSSProperties}
    />
  )
}

