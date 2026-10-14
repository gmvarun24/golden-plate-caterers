'use client'

import { useState, useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/Button'
import { DownloadIcon } from '@/components/ui/icons'

/** Chromium's install event (not in lib.dom yet). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallState =
  { kind: 'unavailable' } | { kind: 'prompt'; event: BeforeInstallPromptEvent } | { kind: 'ios' }

const UNAVAILABLE: InstallState = { kind: 'unavailable' }
const IOS: InstallState = { kind: 'ios' }
let state: InstallState = UNAVAILABLE
const listeners = new Set<() => void>()
const set = (next: InstallState) => {
  state = next
  listeners.forEach((l) => l())
}

// Listen at module load: the browser can fire `beforeinstallprompt` before React hydrates.
if (typeof window !== 'undefined') {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  const isIos =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  if (!standalone && isIos) state = IOS
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    set({ kind: 'prompt', event: e as BeforeInstallPromptEvent })
  })
  window.addEventListener('appinstalled', () => set(UNAVAILABLE))
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/**
 * "Install app" — shown only where installing is possible: Chromium browsers (native prompt) and
 * iOS Safari (which has no prompt API, so we explain Share → Add to Home Screen). Hidden once installed.
 */
export function InstallAppButton({ appName }: { appName: string }) {
  const install = useSyncExternalStore(
    subscribe,
    () => state,
    () => UNAVAILABLE,
  )
  const [showIosHint, setShowIosHint] = useState(false)

  if (install.kind === 'unavailable') return null

  const onClick = async () => {
    if (install.kind === 'ios') {
      setShowIosHint((v) => !v)
      return
    }
    await install.event.prompt()
    await install.event.userChoice
    // A prompt event can only be used once; Chromium fires a fresh one if the user dismissed it.
    set(UNAVAILABLE)
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        aria-expanded={install.kind === 'ios' ? showIosHint : undefined}
      >
        <DownloadIcon />
        Install the {appName} app
      </Button>
      {install.kind === 'ios' && showIosHint && (
        <p role="status" className="max-w-xs text-text-muted">
          Tap <strong className="font-medium text-text">Share</strong>, then{' '}
          <strong className="font-medium text-text">Add to Home Screen</strong>.
        </p>
      )}
    </div>
  )
}
