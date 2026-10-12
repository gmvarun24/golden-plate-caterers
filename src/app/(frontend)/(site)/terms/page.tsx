import type { Metadata } from 'next'

import { PageHeader, Prose, ReviewNotice } from '@/components/layout/PageHeader'
import { EmailMenu } from '@/components/ui/EmailMenu'
import { getBrand } from '@/lib/brand/get-brand'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms for using the Golden Plate Caterers website and requesting quotes.',
  alternates: { canonical: '/terms' },
}

export default async function TermsPage() {
  const brand = await getBrand()
  return (
    <div className="container-content flex flex-col gap-10 pt-12 pb-(--spacing-section) md:pt-16">
      <PageHeader eyebrow="Legal" title="Terms of use" lead="Last updated: October 2026" />
      <ReviewNotice />
      <Prose>
        <h2>Estimates, not offers</h2>
        <p>
          Prices on this website, including the total shown while you customise a menu, are{' '}
          <strong>indicative estimates</strong>. They are not an offer or a contract. The final price, menu and terms
          are agreed with you directly by {brand.name} after we speak, and confirmed in writing.
        </p>
        <h2>No online payment</h2>
        <p>
          This website never asks for payment. If anyone requests payment claiming to be from us through an
          unofficial channel, please contact us on {brand.contact.phone} before paying.
        </p>
        <h2>Quote references</h2>
        <p>
          Each enquiry receives a reference (for example GPC-1026-0042) and a private link. Anyone with that link can
          view the quote, so share it only with people you trust.
        </p>
        <h2>Menus and availability</h2>
        <p>
          Dishes, prices and availability can change. Your quote page keeps a copy of the menu and prices exactly as
          they were when you sent the enquiry.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about these terms: <EmailMenu email={brand.contact.email} className="text-accent underline">
            {brand.contact.email}
          </EmailMenu>.
        </p>
      </Prose>
    </div>
  )
}
