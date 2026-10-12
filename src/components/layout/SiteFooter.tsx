import NextLink from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { InstallAppButton } from '@/components/pwa/InstallAppButton'
import { EmailMenu } from '@/components/ui/EmailMenu'
import { Link } from '@/components/ui/Link'
import { getBrand } from '@/lib/brand/get-brand'
import { telHref, whatsappHref } from '@/lib/contact'

import { FOOTER_NAV } from './nav'

const SOCIAL_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  x: 'X',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
}

/** Always dark — the "evening reception" band that closes every page. */
export async function SiteFooter() {
  const brand = await getBrand()
  const year = new Date().getFullYear()
  return (
    <footer data-theme="dark" className="relative overflow-hidden border-t border-border pb-28 md:pb-0">
      <div aria-hidden="true" className="h-px w-full bg-gradient-gold opacity-70" />
      <div className="container-wide grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="flex flex-col gap-5 md:col-span-4">
          <NextLink href="/" aria-label={`${brand.name} — home`} className="self-start">
            <Logo className="h-11 w-auto" title={brand.name} />
          </NextLink>
          <p className="max-w-xs font-display text-2xl leading-snug text-text">{brand.tagline}</p>
          <p className="text-sm text-text-muted">{brand.serviceArea}</p>
          <div className="text-sm">
            <InstallAppButton appName={brand.shortName} />
          </div>
        </div>

        {Object.entries(FOOTER_NAV).map(([group, links]) => (
          <nav key={group} aria-label={group} className="md:col-span-2">
            <h2 className="eyebrow mb-4 text-text-muted">{group}</h2>
            <ul className="flex flex-col gap-3 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link variant="nav" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="flex flex-col gap-6 text-sm md:col-span-4">
          <div>
            <h2 className="eyebrow mb-4 text-text-muted">Talk to us</h2>
            <ul className="flex flex-col gap-3">
              <li>
                <a href={telHref(brand.contact.phone)} data-analytics="call_click" className="font-display text-2xl hover:text-accent">
                  {brand.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref(brand.contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp_click"
                  className="hover:text-accent"
                >
                  WhatsApp us
                </a>
              </li>
              <li>
                <EmailMenu email={brand.contact.email} className="text-left break-all hover:text-accent">
                  {brand.contact.email}
                </EmailMenu>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="eyebrow mb-3 text-text-muted">Hours</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
              {brand.hours.map((h) => (
                <div key={h.days} className="contents">
                  <dt className="text-text-muted">{h.days}</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-wide flex flex-col gap-3 py-6 text-xs text-text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {brand.name}.
          </p>
          {brand.socials.length > 0 && (
            <ul className="flex gap-5">
              {brand.socials.map((s) => (
                <li key={s.platform}>
                  <Link variant="nav" href={s.url}>
                    {SOCIAL_LABEL[s.platform] ?? s.platform}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
