import type { Metadata } from 'next'
import NextLink from 'next/link'

import { EnquiryForm } from '@/components/enquiry/EnquiryForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmailMenu } from '@/components/ui/EmailMenu'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'
import { getBrand } from '@/lib/brand/get-brand'
import { telHref, whatsappHref } from '@/lib/contact'
import { getEventTypes, getPackage } from '@/lib/data/catalog'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Call, WhatsApp or email Golden Plate Caterers to plan catering for your event.',
  alternates: { canonical: '/contact' },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams
  const menuSlug = typeof params.menu === 'string' ? params.menu : null
  const [brand, pkg, events] = await Promise.all([getBrand(), menuSlug ? getPackage(menuSlug) : Promise.resolve(null), getEventTypes()])
  const message = pkg
    ? `Hi ${brand.name}, I'd like to enquire about the "${pkg.title}" menu.`
    : `Hi ${brand.name}, I'd like to plan catering for an event.`

  const channels = [
    { icon: PhoneIcon, label: 'Call us', value: brand.contact.phone, href: telHref(brand.contact.phone), analytics: 'call_click', external: false },
    { icon: WhatsAppIcon, label: 'WhatsApp', value: 'Chat with our team', href: whatsappHref(brand.contact.whatsapp, message), analytics: 'whatsapp_click', external: true },
  ]
  const cardClass =
    'group flex h-full w-full flex-col gap-4 rounded-md border border-border bg-surface p-6 text-left shadow-sm transition-[border-color,transform] duration-(--duration-base) ease-out-expo hover:-translate-y-0.5 hover:border-border-accent'
  const cardBody = (Icon: typeof MailIcon, label: string, value: string) => (
    <>
      <span className="grid size-12 place-items-center rounded-full border border-accent-fill text-accent">
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-sm text-text-muted">{label}</span>
        <span className="font-medium break-words group-hover:text-accent">{value}</span>
      </span>
    </>
  )

  return (
    <div className="container-wide grid gap-14 pt-12 pb-(--spacing-section) md:pt-16 lg:grid-cols-12">
      <div className="flex flex-col gap-10 lg:col-span-7">
        <PageHeader
          eyebrow="Contact"
          title={
            <>
              Let&rsquo;s plan your <em className="text-accent-display italic">menu</em>
            </>
          }
          lead={
            pkg ? (
              <>
                You&rsquo;re asking about <strong className="text-text">{pkg.title}</strong>. Reach us any way you like —
                mention the menu and your date.
              </>
            ) : (
              'Tell us about your occasion, date and guest count — we reply within one business day.'
            )
          }
        />
        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {channels.map(({ icon: Icon, label, value, href, analytics, external }) => (
            <li key={label}>
              <a
                href={href}
                data-analytics={analytics}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={cardClass}
              >
                {cardBody(Icon, label, value)}
              </a>
            </li>
          ))}
          <li>
            <EmailMenu
              email={brand.contact.email}
              subject={pkg ? `Enquiry: ${pkg.title}` : 'Catering enquiry'}
              body={message}
              className={cardClass}
            >
              {cardBody(MailIcon, 'Email', brand.contact.email)}
            </EmailMenu>
          </li>
        </ul>
        <section aria-labelledby="enquiry-title" className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 id="enquiry-title" className="text-3xl">
              Send an enquiry
            </h2>
            <p className="text-sm text-text-muted">
              No menu in mind yet? Tell us about your event and we’ll suggest one. You’ll get a reference number instantly.
            </p>
          </div>
          <EnquiryForm
            occasions={events.map((e) => ({ slug: e.slug, name: e.name }))}
            defaults={pkg ? { notes: `Interested in the "${pkg.title}" menu.` } : undefined}
          />
        </section>
        <p className="text-sm text-text-muted">
          Prefer to choose dishes first?{' '}
          <NextLink href={pkg ? `/menus/${pkg.slug}` : '/menus'} className="text-accent underline underline-offset-4">
            {pkg ? 'Back to the menu' : 'Browse menus'}
          </NextLink>
          .
        </p>
      </div>

      <aside className="flex flex-col gap-8 rounded-lg border border-border bg-bg-subtle p-8 lg:col-span-5">
        <div>
          <h2 className="eyebrow mb-4 text-text-muted">Business hours</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2">
            {brand.hours.map((h) => (
              <div key={h.days} className="contents">
                <dt className="text-text-muted">{h.days}</dt>
                <dd className="font-medium">{h.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="eyebrow mb-3 text-text-muted">Based in</h2>
          <p>
            {brand.address.locality}, {brand.address.city} {brand.address.postalCode}
          </p>
        </div>
      </aside>
    </div>
  )
}
