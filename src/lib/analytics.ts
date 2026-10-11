/**
 * Custom analytics events (GA4 via gtag when NEXT_PUBLIC_GA4_ID is set — wired in Phase 6).
 * Safe no-op otherwise. Never send personal data (names, phone numbers, emails) as params.
 */
export type AnalyticsEvent =
  | 'package_view'
  | 'customise_change'
  | 'enquiry_submit'
  | 'whatsapp_click'
  | 'call_click'
  | 'email_click'

type Gtag = (command: 'event', name: string, params?: Record<string, string | number | boolean>) => void

export function track(event: AnalyticsEvent, params?: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  try {
    gtag?.('event', event, params)
  } catch {
    /* analytics must never break the page */
  }
}
