import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = ['/', '/menus', '/menus/royal-wedding-banquet', '/occasions/wedding-reception', '/contact', '/faq', '/privacy']

for (const path of PAGES) {
  test(`no serious accessibility violations: ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }) // final state, no mid-animation contrast
    await page.goto(path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([])
  })
}

test('SEO essentials', async ({ page, request }) => {
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toMatch(/Disallow: \/admin/)
  expect(robots).toMatch(/Disallow: \/q\//)
  expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/)

  await page.goto('/menus/royal-wedding-banquet')
  await expect(page).toHaveTitle(/Royal Wedding Banquet/)
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(/\/menus\/royal-wedding-banquet$/)
  const ogUrl = await page.locator('meta[property="og:image"]').first().getAttribute('content')
  expect(ogUrl).toMatch(/opengraph-image/)
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t))
  const types = ld.flat().map((d: { '@type': string }) => d['@type'])
  expect(types).toEqual(expect.arrayContaining(['FoodEstablishment', 'Menu', 'BreadcrumbList']))

  const og = await request.get(new URL(ogUrl!).pathname + new URL(ogUrl!).search)
  expect(og.status()).toBe(200)
  expect(og.headers()['content-type']).toContain('image/png')
})
