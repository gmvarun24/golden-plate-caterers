import { getPackage, getPackageSlugs } from '@/lib/data/catalog'
import { formatINR } from '@/lib/format/currency'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const alt = 'Catering menu by Golden Plate Caterers'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export async function generateStaticParams() {
  return (await getPackageSlugs()).map((slug) => ({ slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const pkg = await getPackage((await params).slug)
  return renderOgImage({
    eyebrow: pkg ? pkg.cuisines.map((c) => c.name).join(' · ') : 'Menu',
    title: pkg?.title ?? 'Golden Plate Caterers',
    subtitle: pkg ? `From ${formatINR(pkg.priceFrom)} per plate · ${pkg.minGuests}–${pkg.maxGuests} guests` : undefined,
    footer: 'Golden Plate Caterers',
  })
}
