/**
 * Plain, robust HTML emails (inline styles, table layout) + text alternatives.
 * Colours are literal here on purpose: email clients don't support CSS variables.
 */
import type { QuoteSnapshotV1 } from '../enquiry/snapshot'
import { formatINR } from '../format/currency'

export type EnquiryEmailData = {
  brandName: string
  referenceId: string
  quoteUrl: string
  adminUrl: string
  customerName: string
  phone: string
  email?: string
  eventType?: string
  eventDate: string
  area: string
  guests: number
  notes?: string
  snapshot: QuoteSnapshotV1 | null
  hoursText: string
  brandPhone: string
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const shell = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#F8F3EA;font-family:Helvetica,Arial,sans-serif;color:#1E1913">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FCF8F1;border:1px solid #E5D8C1;border-radius:8px">
<tr><td style="padding:28px 32px;border-bottom:2px solid #C9A24B"><div style="font-family:Georgia,serif;font-size:22px">${esc(title)}</div></td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6">${body}</td></tr>
</table></td></tr></table></body></html>`

const row = (k: string, v: string) => `<tr><td style="padding:6px 0;color:#655A4B;width:140px;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`

function quoteTable(s: QuoteSnapshotV1): string {
  const lines = s.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0">${esc(l.label)}${l.quantity > 1 ? ` <span style="color:#655A4B">(${formatINR(l.unitPrice)} × ${l.quantity})</span>` : ''}</td><td align="right" style="padding:6px 0">${formatINR(l.amount)}</td></tr>`,
    )
    .join('')
  const menu = s.sections
    .filter((sec) => sec.items.length)
    .map((sec) => `<p style="margin:0 0 8px"><strong>${esc(sec.title)}:</strong> ${sec.items.map((i) => esc(i.name)).join(', ')}</p>`)
    .join('')
  return `<h3 style="font-family:Georgia,serif;font-weight:normal;margin:24px 0 8px">${esc(s.package.title)}</h3>${menu}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid #E5D8C1">${lines}
<tr><td style="padding:10px 0;border-top:1px solid #E5D8C1"><strong>Indicative total</strong></td><td align="right" style="padding:10px 0;border-top:1px solid #E5D8C1"><strong>${formatINR(s.total)}</strong></td></tr></table>
<p style="color:#655A4B;font-size:13px">${esc(s.disclaimer)}</p>`
}

export function adminEnquiryEmail(d: EnquiryEmailData) {
  const subject = `New enquiry ${d.referenceId} — ${d.eventType ?? 'Event'}, ${d.guests} guests, ${d.eventDate}`
  const body = `<p style="margin-top:0">A new enquiry has arrived.</p>
<table role="presentation" cellpadding="0" cellspacing="0">${row('Reference', d.referenceId)}${row('Name', d.customerName)}${row('Phone', d.phone)}${d.email ? row('Email', d.email) : ''}${row('Event', d.eventType ?? '—')}${row('Date', d.eventDate)}${row('Area', d.area)}${row('Guests', String(d.guests))}${d.notes ? row('Notes', d.notes) : ''}</table>
${d.snapshot ? quoteTable(d.snapshot) : '<p><em>General enquiry (no menu selected).</em></p>'}
<p style="margin-top:24px"><a href="${esc(d.adminUrl)}" style="background:#C9A24B;color:#1E1913;padding:12px 20px;border-radius:999px;text-decoration:none;display:inline-block">Open in admin</a></p>`
  const text = [
    `New enquiry ${d.referenceId}`,
    `Name: ${d.customerName}`,
    `Phone: ${d.phone}`,
    d.email ? `Email: ${d.email}` : null,
    `Event: ${d.eventType ?? '—'} on ${d.eventDate}, ${d.guests} guests, ${d.area}`,
    d.notes ? `Notes: ${d.notes}` : null,
    d.snapshot ? `Menu: ${d.snapshot.package.title} — indicative total ${formatINR(d.snapshot.total)}` : 'General enquiry',
    `Admin: ${d.adminUrl}`,
  ]
    .filter(Boolean)
    .join('\n')
  return { subject, html: shell(`New enquiry ${d.referenceId}`, body), text }
}

export function customerConfirmationEmail(d: EnquiryEmailData) {
  const first = d.customerName.split(/\s+/)[0] ?? d.customerName
  const subject = `Your enquiry ${d.referenceId} — ${d.brandName}`
  const body = `<p style="margin-top:0">Dear ${esc(first)},</p>
<p>Thank you for your enquiry. Your reference is</p>
<p style="font-family:Georgia,serif;font-size:28px;letter-spacing:1px;margin:8px 0 16px">${esc(d.referenceId)}</p>
<p>We’ll call you within one business day to talk through your menu and confirm the details. You can view your quote at any time:</p>
<p><a href="${esc(d.quoteUrl)}" style="background:#C9A24B;color:#1E1913;padding:12px 20px;border-radius:999px;text-decoration:none;display:inline-block">View your quote</a></p>
${d.snapshot ? quoteTable(d.snapshot) : ''}
<p>Questions? Call us on ${esc(d.brandPhone)} and mention your reference. <br><span style="color:#655A4B">${esc(d.hoursText)}</span></p>
<p style="color:#655A4B;font-size:13px">There is no online payment — we never ask for payment by email or link.</p>`
  const text = `Dear ${first},\n\nThank you for your enquiry. Your reference is ${d.referenceId}.\nView your quote: ${d.quoteUrl}\n\nWe'll call you within one business day. Questions? Call ${d.brandPhone} and mention your reference.\n${d.hoursText}`
  return { subject, html: shell(d.brandName, body), text }
}
