import { describe, expect, it } from 'vitest'

import { brandDefaults } from '@/config/brand'
import { breadcrumbJsonLd, businessJsonLd, openingHours } from '@/lib/seo/jsonld'

describe('JSON-LD', () => {
  it('parses business hours', () => {
    expect(openingHours(brandDefaults.hours)).toEqual([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '20:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: '10:00', closes: '18:00' },
    ])
    expect(openingHours([{ days: 'Festivals', hours: 'by appointment' }])).toEqual([])
  })

  it('builds the business from brand settings only', () => {
    const b = businessJsonLd(brandDefaults, 'https://example.in', [{ slug: 'udupi', name: 'Udupi' }], '₹350–₹1,500')
    expect(b['@type']).toBe('FoodEstablishment')
    expect(b.name).toBe('Golden Plate Caterers')
    expect(b.servesCuisine).toEqual(['Udupi'])
  })

  it('builds breadcrumbs', () => {
    expect(breadcrumbJsonLd('https://x.in', [{ name: 'Menus', path: '/menus' }]).itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Menus', item: 'https://x.in/menus' },
    ])
  })
})
