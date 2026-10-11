import { defineConfig, devices } from '@playwright/test'

const PORT = 3200
const BASE_URL = `http://localhost:${PORT}`
const E2E_DB = process.env.E2E_DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/golden_plate_e2e'

/**
 * End-to-end tests against a production build on :3200 with its own database and build dir,
 * so they never touch your dev data or your running dev server. Requires `npm run db:up`.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /enquiry\.spec\.ts/ },
  ],
  webServer: {
    command: `npx tsx --env-file=.env scripts/e2e-prepare.ts && npx next build && npx next start -p ${PORT}`,
    url: BASE_URL,
    timeout: 600_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    env: {
      DATABASE_URL: E2E_DB,
      NEXT_DIST_DIR: '.next-e2e',
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      EMAIL_PROVIDER: 'console',
      NODE_OPTIONS: '--no-deprecation',
    },
  },
})
