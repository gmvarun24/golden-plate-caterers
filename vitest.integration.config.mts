import path from 'node:path'

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

/**
 * Integration tests against a real Postgres database (default: `golden_plate_test` on the
 * docker-compose server; override with TEST_DATABASE_URL). The database is created and seeded
 * automatically and never touches your dev data.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: { 'server-only': path.resolve(__dirname, 'tests/integration/server-only-stub.ts') },
  },
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.int.test.ts'],
    globalSetup: ['tests/integration/global-setup.ts'],
    setupFiles: ['tests/integration/setup.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
})
