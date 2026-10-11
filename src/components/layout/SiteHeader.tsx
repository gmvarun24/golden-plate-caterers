import NextLink from 'next/link'

import { Logo, LogoMark } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { buttonVariants } from '@/components/ui/Button'
import { PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'
import { Link } from '@/components/ui/Link'
import { getBrand } from '@/lib/brand/get-brand'
import { cn } from '@/lib/cn'
import { telHref, whatsappHref } from '@/lib/contact'

import { MobileNav } from './MobileNav'
import { PRIMARY_NAV } from './nav'

export async function SiteHeader() {
  const brand = await getBrand()
  const wa = whatsappHref(brand.contact.whatsapp, `Hi ${brand.name}, I'd like to plan catering for an event.`)
  return (
    <header className="sticky top-0 z-(--z-header) border-b border-border/70 bg-bg/95 backdrop-blur-md supports-[backdrop-filter]:bg-bg/80">
      <div className="container-wide flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <NextLink href="/" aria-label={`${brand.name} — home`} className="shrink-0 rounded-sm">
          <Logo className="hidden h-11 sm:inline-block" title={brand.name} />
          <span className="flex items-center gap-2 sm:hidden">
            <LogoMark className="size-8" />
            <span className="font-display text-xl">{brand.shortName}</span>
          </span>
        </NextLink>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm font-medium">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link variant="nav" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <a
            href={telHref(brand.contact.phone)}
            aria-label={`Call ${brand.contact.phone}`}
            data-analytics="call_click"
            data-cursor="magnetic"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'hidden md:inline-flex')}
          >
            <PhoneIcon />
          </a>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp_click"
            className={cn(buttonVariants({ variant: 'leaf', size: 'sm' }), 'hidden md:inline-flex')}
          >
            <WhatsAppIcon /> WhatsApp
          </a>
          <MobileNav phone={brand.contact.phone} whatsappHref={wa} />
        </div>
      </div>
    </header>
  )
}
