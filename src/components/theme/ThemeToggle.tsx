'use client'

import { useTheme } from 'next-themes'
import { useId, useSyncExternalStore } from 'react'

import { cn } from '@/lib/cn'

import styles from './ThemeToggle.module.css'

/**
 * Sun ↔ moon morph. The sun is a small gold plate with rays; for night, a shadow disc slides
 * across it to cut a crescent. The visual state is driven by CSS from <html data-theme>, so
 * the first paint is already correct (no mounted flicker, no hydration mismatch).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const maskId = `gp-theme-mask-${useId().replace(/:/g, '')}`
  // false during SSR/hydration, true on the client — avoids a label mismatch without an effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const isDark = resolvedTheme === 'dark'
  const label = !mounted ? 'Toggle colour theme' : isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      data-cursor="magnetic"
      className={cn(
        'relative inline-grid size-11 place-items-center rounded-full text-text',
        'transition-colors duration-(--duration-fast) ease-standard hover:bg-accent-soft hover:text-accent',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className={cn(styles.icon, 'size-6')} aria-hidden="true">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect width="24" height="24" fill="white" />
          <circle className={styles.bite} cx="24" cy="2" r="8" fill="black" />
        </mask>
        {/* Mask sits on an untransformed group so the bite moves in icon coordinates. */}
        <g mask={`url(#${maskId})`}>
          <circle className={styles.core} cx="12" cy="12" r="5" fill="currentColor" />
        </g>
        <g className={styles.rays} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <line x1="12" y1="1.75" x2="12" y2="3.75" />
          <line x1="12" y1="20.25" x2="12" y2="22.25" />
          <line x1="1.75" y1="12" x2="3.75" y2="12" />
          <line x1="20.25" y1="12" x2="22.25" y2="12" />
          <line x1="4.75" y1="4.75" x2="6.2" y2="6.2" />
          <line x1="17.8" y1="17.8" x2="19.25" y2="19.25" />
          <line x1="4.75" y1="19.25" x2="6.2" y2="17.8" />
          <line x1="17.8" y1="6.2" x2="19.25" y2="4.75" />
        </g>
      </svg>
    </button>
  )
}
