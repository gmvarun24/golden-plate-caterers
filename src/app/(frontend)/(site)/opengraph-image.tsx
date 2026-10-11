import { getBrand } from '@/lib/brand/get-brand'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const alt = 'Golden Plate Caterers — event catering'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  const brand = await getBrand()
  return renderOgImage({
    eyebrow: 'Event catering',
    title: brand.tagline.replace(/in gold\.?$/, '*in gold*'),
    subtitle: 'Weddings · Receptions · Gruhapravesha · Birthdays · Corporate',
    footer: brand.name,
  })
}
