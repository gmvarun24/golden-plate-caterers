import type { Metadata } from 'next'

import { PageHeader, Prose, ReviewNotice } from '@/components/layout/PageHeader'
import { EmailMenu } from '@/components/ui/EmailMenu'
import { getBrand } from '@/lib/brand/get-brand'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Golden Plate Caterers collects, uses and protects your personal data.',
  alternates: { canonical: '/privacy' },
}

export default async function PrivacyPage() {
  const brand = await getBrand()
  return (
    <div className="container-content flex flex-col gap-10 pt-12 pb-(--spacing-section) md:pt-16">
      <PageHeader eyebrow="Legal" title="Privacy policy" lead="Last updated: October 2026" />
      <ReviewNotice />
      <Prose>
        <p>
          {brand.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This policy explains what personal data we
          collect when you use this website or send us an enquiry, why we collect it, and the rights you have under
          the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;).
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Enquiry details you give us:</strong> name, mobile number, optional email, event type and date,
            area/locality, guest count, your menu selection and any notes.
          </li>
          <li>
            <strong>Consent record:</strong> that you agreed to be contacted, and when.
          </li>
          <li>
            <strong>Basic technical data:</strong> pages visited and the campaign that brought you here (UTM tags),
            and — only if analytics is enabled — anonymous usage statistics. To prevent abuse we keep a one-way hash of
            your IP address for a short time; we do not store your raw IP address with your enquiry.
          </li>
        </ul>
        <h2>Why we use it</h2>
        <p>
          Only to respond to your enquiry: to call or message you about your event, prepare and confirm a quote, and
          deliver the catering you book. We do not sell your data and we do not use it for unrelated marketing without
          asking you first.
        </p>
        <h2>Who we share it with</h2>
        <p>
          With the kitchen partner preparing your event, limited to what they need (for example, date, guest count
          and menu), and with service providers who host this website and send our emails, under contracts that
          require them to protect it.
        </p>
        <h2>How long we keep it</h2>
        <p>
          Enquiries that do not become bookings are deleted or anonymised within 12 months. Booking records are kept
          as long as tax and accounting law requires.
        </p>
        <h2>Your rights</h2>
        <p>Under the DPDP Act you may:</p>
        <ul>
          <li>ask for a summary of the personal data we hold about you;</li>
          <li>ask us to correct, complete or update it;</li>
          <li>withdraw your consent and ask us to erase it (unless we must keep it by law);</li>
          <li>nominate another person to exercise these rights on your behalf; and</li>
          <li>raise a grievance with us, and if unresolved, with the Data Protection Board of India.</li>
        </ul>
        <h2>Grievance officer</h2>
        <p>
          Email <EmailMenu email={brand.contact.email} className="text-accent underline">
            {brand.contact.email}
          </EmailMenu> or call {brand.contact.phone}. We
          respond within 30 days. <em>[Name and postal address of the grievance officer to be added.]</em>
        </p>
        <h2>Cookies</h2>
        <p>
          We use a small amount of local storage to remember your colour theme and your in-progress menu selection on
          this device. Analytics cookies are used only if enabled and can be blocked in your browser.
        </p>
      </Prose>
    </div>
  )
}
