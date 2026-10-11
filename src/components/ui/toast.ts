'use client'

/**
 * `toast()` that works before the toast container has mounted: it signals the lazy Toaster,
 * loads sonner, then shows the message on the next tick.
 */
type Options = { description?: string }
type Kind = 'message' | 'success' | 'error'

async function show(kind: Kind, message: string, options?: Options) {
  window.dispatchEvent(new Event('gp:toast'))
  const { toast } = await import('sonner')
  // Give the container a frame to mount if this is the first toast.
  requestAnimationFrame(() => (kind === 'message' ? toast(message, options) : toast[kind](message, options)))
}

export const toast = Object.assign((message: string, options?: Options) => void show('message', message, options), {
  success: (message: string, options?: Options) => void show('success', message, options),
  error: (message: string, options?: Options) => void show('error', message, options),
})
