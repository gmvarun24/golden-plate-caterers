import type { Metadata } from 'next'
import NextLink from 'next/link'

import { LogoMark } from '@/components/brand/Logo'
import { HowItWorks } from '@/components/home/HowItWorks'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { PageHeader } from '@/components/layout/PageHeader'
import { buttonVariants } from '@/components/ui/Button'
import { getBrand } from '@/lib/brand/get-brand'
import { getSiteContent } from '@/lib/data/site'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Golden Plate Caterers brings the finest kitchens together under one name — curated menus, honest pricing and polished service.',
  alternates: { canonical: '/about' },
}

export default async function AboutPage() {
  const [brand, site] = await Promise.all([getBrand(), getSiteContent()])
  return (
    <>
      <div className="container-wide grid gap-12 pt-12 pb-(--spacing-section) md:pt-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PageHeader
            eyebrow="About us"
            title={
              <>
                One name. Every <em className="text-accent-display italic">plate</em>.
              </>
            }
            lead={`${brand.name} was founded with a simple idea: planning food for a family occasion should feel as warm as the occasion itself.`}
          />
          <div className="mt-10 flex max-w-prose flex-col gap-5 text-lg text-text-muted">
            <p>
              We work with a small circle of trusted kitchens, each chosen for what it does best — sattvik Udupi
              feasts, coastal seafood, Chettinad spice, Jain cooking. You only ever deal with us: one team that
              plans your menu, tastes it, prices it honestly and takes responsibility on the day.
            </p>
            <p>
              Every menu on this site can be customised dish by dish, with an indicative price that updates as you
              choose. When you&rsquo;re ready, send it to us — we&rsquo;ll call, talk it through and confirm
              everything in person. No online payment, no surprises.
            </p>
          </div>
          <NextLink href="/menus" className={`${buttonVariants({ size: 'lg' })} mt-10`}>
            Explore menus
          </NextLink>
        </div>
        <div className="flex items-center justify-center lg:col-span-5">
          <LogoMark className="size-64 opacity-90 md:size-80" />
        </div>
      </div>
      <WhyChooseUs items={site.whyChooseUs} />
      <HowItWorks />
    </>
  )
}
