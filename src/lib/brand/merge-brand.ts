import { brandSchema, type Brand } from '@/config/brand'
import type { BrandSetting, Media } from '@/payload-types'

const nonEmpty = (v: string | null | undefined): string | undefined =>
  v && v.trim().length > 0 ? v.trim() : undefined

const mediaUrl = (m: number | Media | null | undefined): string | undefined =>
  m && typeof m === 'object' ? nonEmpty(m.url) : undefined

/** Merge the Brand Settings global over the code defaults. Pure — exported for tests. */
export function mergeBrand(defaults: Brand, g: Partial<BrandSetting> | null | undefined): Brand {
  if (!g) return defaults
  const merged: Brand = {
    name: nonEmpty(g.name) ?? defaults.name,
    shortName: nonEmpty(g.shortName) ?? defaults.shortName,
    tagline: nonEmpty(g.tagline) ?? defaults.tagline,
    referencePrefix: nonEmpty(g.referencePrefix) ?? defaults.referencePrefix,
    logo: {
      light: mediaUrl(g.logoLight) ?? defaults.logo.light,
      dark: mediaUrl(g.logoDark) ?? defaults.logo.dark,
      mono: mediaUrl(g.logoMono) ?? defaults.logo.mono,
      markLight: defaults.logo.markLight,
      markDark: defaults.logo.markDark,
      favicon: mediaUrl(g.favicon) ?? defaults.logo.favicon,
    },
    contact: {
      phone: nonEmpty(g.phone) ?? defaults.contact.phone,
      whatsapp: nonEmpty(g.whatsapp) ?? defaults.contact.whatsapp,
      email: nonEmpty(g.email) ?? defaults.contact.email,
    },
    hours: g.hours?.length
      ? g.hours.map(({ days, hours }) => ({ days, hours }))
      : defaults.hours,
    address: {
      locality: nonEmpty(g.locality) ?? defaults.address.locality,
      city: nonEmpty(g.city) ?? defaults.address.city,
      region: nonEmpty(g.region) ?? defaults.address.region,
      postalCode: nonEmpty(g.postalCode) ?? defaults.address.postalCode,
      country: defaults.address.country,
    },
    serviceArea: nonEmpty(g.serviceArea) ?? defaults.serviceArea,
    socials: g.socials?.length
      ? g.socials.map(({ platform, url }) => ({ platform, url }))
      : defaults.socials,
  }
  // An invalid admin value must never take the site down: fall back to defaults.
  const parsed = brandSchema.safeParse(merged)
  return parsed.success ? parsed.data : defaults
}
