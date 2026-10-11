import { getEventType, getEventTypes } from '@/lib/data/catalog'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const alt = 'Event catering by Golden Plate Caterers'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export async function generateStaticParams() {
  return (await getEventTypes()).map((e) => ({ slug: e.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const event = await getEventType((await params).slug)
  const name = event?.name.replace(/\s*\(.*\)$/, '') ?? 'Event'
  return renderOgImage({
    eyebrow: event?.tagline ?? 'Occasions',
    title: `${name} *catering*`,
    subtitle: 'Curated menus · live estimate · we call you',
    footer: 'Golden Plate Caterers',
  })
}
