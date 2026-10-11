import { expect, test } from '@playwright/test'

import { vendors } from '../../scripts/seed/data'

/** Every identifying vendor string from the seed — none may ever reach a public response. */
const FORBIDDEN: string[] = vendors.flatMap((v) => [v.name, v.code, v.contactPerson, v.phone, v.email])
const FORBIDDEN_FIELDS = [/costPricePerPlate/, /"vendor"\s*:/]

test('no vendor data in any public page, sitemap URL or anonymous API response', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  const pages = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]!).pathname)
  expect(pages.length).toBeGreaterThan(15)

  const api = [
    '/api/packages',
    '/api/packages?depth=2',
    '/api/vendors',
    '/api/menu-items',
    '/api/add-ons',
    '/api/enquiries',
    '/api/users',
    '/api/media',
    '/api/globals/brand-settings',
    '/api/globals/site-settings',
    '/robots.txt',
  ]

  for (const path of [...pages, ...api]) {
    const res = await request.get(path)
    const body = res.headers()['content-type']?.includes('image') ? '' : await res.text()
    for (const s of FORBIDDEN) expect(body, `${path} leaks "${s}"`).not.toContain(s)
    for (const re of FORBIDDEN_FIELDS) expect(body, `${path} exposes ${re}`).not.toMatch(re)
  }
})

test('catalogue and enquiry APIs are closed to anonymous users', async ({ request }) => {
  for (const path of ['/api/packages', '/api/vendors', '/api/enquiries', '/api/users', '/api/enquiries/export.csv']) {
    const res = await request.get(path)
    expect([401, 403], path).toContain(res.status())
  }
})
