import type { Metadata } from 'next'
import NextLink from 'next/link'

import { FaqList } from '@/components/home/FaqList'
import { PageHeader } from '@/components/layout/PageHeader'
import { JsonLd } from '@/components/seo/JsonLd'
import { getSiteContent } from '@/lib/data/site'
import { faqJsonLd } from '@/lib/seo/jsonld'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'How pricing works, minimum guests, Jain and sattvik food, service areas and booking — answers to common catering questions.',
  alternates: { canonical: '/faq' },
}

export default async function FaqPage() {
  const site = await getSiteContent()
  return (
    <div className="container-content flex flex-col gap-12 pt-12 pb-(--spacing-section) md:pt-16">
      {site.faq.length > 0 && <JsonLd data={faqJsonLd(site.faq)} />}
      <PageHeader eyebrow="FAQ" title="Questions, answered" lead="Can’t find what you’re looking for? Call or WhatsApp us — we’re happy to help." />
      <FaqList items={site.faq} headingLevel="h2" />
      <p className="text-text-muted">
        Still unsure?{' '}
        <NextLink href="/contact" className="text-accent underline underline-offset-4">
          Get in touch
        </NextLink>
        .
      </p>
    </div>
  )
}
