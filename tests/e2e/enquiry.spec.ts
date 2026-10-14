import { expect, test } from '@playwright/test'

/** The core journey: browse → customise → enquire → quote page. */
test('browse, customise, enquire and land on the quote page', async ({ page, isMobile }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Every occasion')

  // Browse: filter menus by diet via the URL-synced filters
  await page.goto('/menus?diet=veg')
  await expect(page.getByRole('heading', { name: /menus?$/, level: 2 })).toBeVisible()
  await page.getByRole('link', { name: 'Gruhapravesha Sattvik Sadya' }).click()
  await expect(page).toHaveURL(/\/menus\/gruhapravesha-sattvik-sadya/)

  // Customise: 250 guests (₹480 tier), satisfy every section rule, add a per-plate add-on
  const guests = page.getByRole('spinbutton', { name: /number of guests/i })
  await guests.fill('250')
  await guests.press('Enter')
  await expect(page.getByText(/₹480 per plate/)).toBeVisible()

  await page.getByRole('checkbox', { name: /Mysore Bonda/ }).click()
  await page.getByRole('checkbox', { name: /Vegetable Sagu/ }).click()
  await page.getByRole('checkbox', { name: /Live dosa counter/ }).click()

  // ₹480 × 250 + ₹60 × 250 = ₹1,35,000
  const summary = isMobile ? page.getByText('Indicative total').locator('..') : page.getByRole('complementary', { name: 'Price summary' })
  await expect(summary).toContainText('₹1,35,000')

  // Open the enquiry form
  if (isMobile) {
    await page.getByRole('button', { name: /Review & send/ }).click()
    await page.getByRole('dialog', { name: 'Your estimate' }).getByRole('button', { name: 'Send enquiry' }).click()
  } else {
    await summary.getByRole('button', { name: 'Send enquiry' }).click()
  }
  const form = page.getByRole('dialog', { name: 'Send your enquiry' })
  await expect(form).toBeVisible()

  await form.getByLabel(/Your name/).fill('E2E Tester')
  await form.getByLabel(/Mobile number/).fill('91234 56789')
  await form.getByLabel(/Area \/ locality/).fill('Malleshwaram')
  await form.getByRole('button', { name: /Event date|Choose a date/ }).click()
  const nextMonth = page.getByRole('button', { name: /next month/i })
  await nextMonth.click()
  await page.locator('.rdp-day:not(.rdp-disabled) button').first().click()
  await form.getByRole('checkbox', { name: /I agree to be contacted/ }).click()
  await form.getByRole('button', { name: /Send enquiry & get my reference/ }).click()

  // Quote page
  await expect(page).toHaveURL(/\/q\/GPC-\d{4}-\d{4,}-[a-z2-9]{6}$/, { timeout: 30_000 })
  const reference = await page.getByText(/^GPC-\d{4}-\d{4,}$/).first().textContent()
  expect(reference).toMatch(/^GPC-\d{4}-\d{4,}$/)
  await expect(page.getByText('Thank you, E2E')).toBeVisible()
  await expect(page.getByText('₹1,35,000').first()).toBeVisible()
  // Never shows the full phone number
  await expect(page.locator('body')).not.toContainText('91234 56789')

  // Contact actions carry the reference
  const main = page.getByRole('main')
  const wa = await main.getByRole('link', { name: 'WhatsApp', exact: true }).getAttribute('href')
  expect(decodeURIComponent(wa ?? '')).toContain(`discuss quote ${reference}`)
  await main.getByRole('button', { name: 'Email', exact: true }).click()
  const mail = await page.getByRole('menuitem', { name: 'Open email app' }).getAttribute('href')
  expect(decodeURIComponent(mail ?? '')).toContain(`Quote ${reference}`)
  const gmail = new URL((await page.getByRole('menuitem', { name: 'Open in Gmail' }).getAttribute('href')) ?? '')
  expect(gmail.searchParams.get('su')).toContain(`Quote ${reference}`)
  await page.keyboard.press('Escape')

  // Wrong token → 404
  const res = await page.request.get(page.url().replace(/-[a-z2-9]{6}$/, '-aaaaaa'))
  expect(res.status()).toBe(404)
})

test('form validation blocks bad input and the honeypot stays hidden', async ({ page }) => {
  await page.goto('/contact')
  const send = page.getByRole('button', { name: 'Send enquiry' })
  await send.click()
  await expect(page.getByText('Please enter your name')).toBeVisible()
  await page.getByLabel(/Mobile number/).fill('12345')
  await send.click()
  await expect(page.getByText(/valid 10-digit Indian mobile/)).toBeVisible()
  // Honeypot: off-screen and hidden from assistive tech (bots still see and fill it).
  const honeypot = page.locator('input[name="website"]')
  await expect(honeypot).toHaveAttribute('tabindex', '-1')
  expect((await honeypot.boundingBox())?.x ?? 0).toBeLessThan(0)
  await expect(page.getByRole('textbox', { name: 'Website' })).toHaveCount(0)
})
