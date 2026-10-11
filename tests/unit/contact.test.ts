import { describe, expect, it } from 'vitest'

import { mailtoHref, telHref, whatsappHref } from '@/lib/contact'

describe('contact links', () => {
  it('builds wa.me links with an encoded message', () => {
    expect(whatsappHref('91 98765-43210')).toBe('https://wa.me/919876543210')
    expect(whatsappHref('919876543210', 'Hi — quote GPC-1026-0042, 300 guests & more')).toBe(
      'https://wa.me/919876543210?text=Hi%20%E2%80%94%20quote%20GPC-1026-0042%2C%20300%20guests%20%26%20more',
    )
  })

  it('builds tel links from display formats', () => {
    expect(telHref('+91 98765 43210')).toBe('tel:+919876543210')
  })

  it('builds mailto links with subject and body', () => {
    expect(mailtoHref('a@b.in')).toBe('mailto:a@b.in')
    expect(mailtoHref('a@b.in', 'Quote GPC-1026-0042 – Wedding', 'Link: https://x.in/q/1?a=b')).toBe(
      'mailto:a@b.in?subject=Quote%20GPC-1026-0042%20%E2%80%93%20Wedding&body=Link%3A%20https%3A%2F%2Fx.in%2Fq%2F1%3Fa%3Db',
    )
  })
})
