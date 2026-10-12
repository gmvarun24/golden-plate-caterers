/** Contact link builders (pure — unit tested). */

/** `https://wa.me/919876543210?text=…` — number is digits only incl. country code. */
export function whatsappHref(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '')
  return message ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/${digits}`
}

/** `tel:+919876543210` from any display format ("+91 98765 43210"). */
export function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return `tel:${cleaned}`
}

/** `mailto:` with properly encoded subject and body. */
export function mailtoHref(email: string, subject?: string, body?: string): string {
  const params = [
    subject ? `subject=${encodeURIComponent(subject)}` : null,
    body ? `body=${encodeURIComponent(body)}` : null,
  ].filter(Boolean)
  return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`
}

/** Gmail's web compose window, pre-filled — works when the visitor has no mail app set up. */
export function gmailComposeHref(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email })
  if (subject) params.set('su', subject)
  if (body) params.set('body', body)
  return `https://mail.google.com/mail/?${params.toString()}`
}
