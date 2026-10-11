/**
 * Public DTOs — the ONLY shapes that public pages and client components receive.
 * There is deliberately no vendor, cost-price or internal field anywhere in this file.
 */
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import type { AddOnCategory, AddOnPricingType, Diet, DishDiet } from '../catalog/constants'
import type { Tier } from '../pricing/tiers'

export type ImageSize = { url: string; width: number; height: number }

export type PublicImage = {
  url: string
  alt: string
  width: number
  height: number
  focalX: number
  focalY: number
  sizes: { thumb?: ImageSize; card?: ImageSize; hero?: ImageSize; og?: ImageSize }
}

export type PublicSeo = { title: string | null; description: string | null; image: PublicImage | null }

export type PublicCuisine = { slug: string; name: string }
export type PublicEventRef = { slug: string; name: string }

export type PublicEventType = PublicEventRef & {
  tagline: string
  description: string
  image: PublicImage | null
  seo: PublicSeo
}

export type PublicMenuItem = {
  /** Selection key (unique within the package). */
  id: string
  dishId: string
  name: string
  description: string
  diet: DishDiet
  spiceLevel: 0 | 1 | 2 | 3
  isPremium: boolean
  /** Extra ₹ per plate when chosen (0 for standard dishes). */
  surchargePerPlate: number
  defaultSelected: boolean
  image: PublicImage | null
}

export type PublicSection = {
  id: string
  title: string
  description: string
  min: number
  max: number
  items: PublicMenuItem[]
}

export type PublicAddOn = {
  id: string
  name: string
  description: string
  pricingType: AddOnPricingType
  price: number
  category: AddOnCategory
  image: PublicImage | null
}

export type PublicPackageCard = {
  slug: string
  title: string
  diet: Diet
  shortDescription: string
  cuisines: PublicCuisine[]
  eventTypes: PublicEventRef[]
  image: PublicImage | null
  minGuests: number
  maxGuests: number
  tiers: Tier[]
  priceFrom: number
  priceTo: number
  featured: boolean
  popularity: number
}

export type PublicPackage = PublicPackageCard & {
  description: SerializedEditorState | null
  gallery: PublicImage[]
  sections: PublicSection[]
  addOns: PublicAddOn[]
  seo: PublicSeo
}
