import NextLink from 'next/link'

import { buttonVariants } from '@/components/ui/Button'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'
import type { Brand } from '@/config/brand'
import { mailtoHref, telHref, whatsappHref } from '@/lib/contact'

import { Emphasis } from './Emphasis'

/** Dark "evening" band with every way to reach us. */
export function ContactCta({ brand, headline, body }: { brand: Brand; headline: string; body: string }) {
  return (
    <section
      data-theme="dark"
      aria-labelledby="cta-title"
      className="relative overflow-hidden py-(--spacing-section)"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,var(--color-accent-soft),transparent_70%)]"
      />
      <div className="container-content relative flex flex-col items-center gap-8 text-center">
        <p className="eyebrow text-accent">Let&rsquo;s talk</p>
        <h2 id="cta-title" className="text-5xl leading-tight tracking-display text-balance">
          <Emphasis text={headline} />
        </h2>
        <p className="max-w-xl text-lg text-text-muted">{body}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={telHref(brand.contact.phone)}
            data-analytics="call_click"
            className={buttonVariants({ size: 'lg' })}
          >
            <PhoneIcon /> {brand.contact.phone}
          </a>
          <a
            href={whatsappHref(
              brand.contact.whatsapp,
              `Hi ${brand.name}, I'd like to plan catering for an event.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp_click"
            className={buttonVariants({ size: 'lg', variant: 'leaf' })}
          >
            <WhatsAppIcon /> WhatsApp
          </a>
          <a
            href={mailtoHref(brand.contact.email, 'Catering enquiry')}
            data-analytics="email_click"
            className={buttonVariants({ size: 'lg', variant: 'secondary' })}
          >
            <MailIcon /> Email
          </a>
        </div>
        <p className="text-sm text-text-muted">
          {brand.hours.map((h) => `${h.days}: ${h.hours}`).join(' · ')}
        </p>
        <NextLink
          href="/menus"
          className="text-sm text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Or browse menus and get an instant estimate
        </NextLink>
      </div>
    </section>
  )
}
