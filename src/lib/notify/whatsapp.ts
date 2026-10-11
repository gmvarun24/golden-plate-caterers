import 'server-only'

import { serverEnv } from '@/lib/env'

/** Pluggable admin WhatsApp notification. Swap the implementation for a specific provider later. */
export interface WhatsAppNotifier {
  notify(text: string): Promise<void>
}

class NoopNotifier implements WhatsAppNotifier {
  async notify() {}
}

/**
 * Generic webhook: POSTs `{ to, text }` as JSON with a bearer token. Works with most WhatsApp
 * Business API gateways (or a small adapter function in front of one).
 */
class WebhookNotifier implements WhatsAppNotifier {
  constructor(private url: string, private token: string | undefined, private to: string | undefined) {}
  async notify(text: string) {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}) },
      body: JSON.stringify({ to: this.to, text }),
    })
    if (!res.ok) throw new Error(`WhatsApp webhook responded ${res.status}`)
  }
}

export function getWhatsAppNotifier(): WhatsAppNotifier {
  if (!serverEnv.WHATSAPP_NOTIFY_ENABLED || !serverEnv.WHATSAPP_WEBHOOK_URL) return new NoopNotifier()
  return new WebhookNotifier(serverEnv.WHATSAPP_WEBHOOK_URL, serverEnv.WHATSAPP_WEBHOOK_TOKEN, serverEnv.WHATSAPP_ADMIN_NUMBER)
}
