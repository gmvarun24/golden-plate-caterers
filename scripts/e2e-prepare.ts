/**
 * Prepares the isolated e2e database: drop → create → push schema → seed → owner account.
 * Refuses to touch any database whose name doesn't contain "e2e".
 */
import pg from 'pg'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is required')
  const db = new URL(url)
  const name = db.pathname.slice(1)
  if (!name.includes('e2e')) throw new Error(`Refusing to reset "${name}" — e2e database names must contain "e2e".`)
  const admin = new URL(url)
  admin.pathname = '/postgres'
  const client = new pg.Client({ connectionString: admin.toString() })
  await client.connect()
  await client.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
  await client.query(`CREATE DATABASE "${name}"`)
  await client.end()

  // Imported after the DB exists so Payload connects (and pushes the schema) to the fresh database.
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')
  const { runSeed } = await import('./seed/index')
  const payload = await getPayload({ config })
  await runSeed(payload)
  await payload.create({
    collection: 'users',
    data: { email: 'owner@e2e.local', password: 'e2e-owner-pass', name: 'E2E Owner', role: 'owner' },
    overrideAccess: true,
  })
  console.log(`[e2e] database "${name}" ready`)
  process.exit(0)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
