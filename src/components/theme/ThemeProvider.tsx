'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

/**
 * Light/dark theming. next-themes injects a blocking script that sets `data-theme` and
 * `color-scheme` on <html> before first paint, so there is no flash of the wrong theme.
 * Default follows the OS; an explicit choice is persisted in localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey="gp-theme"
    >
      {children}
    </NextThemesProvider>
  )
}
