import pg from 'pg'

import { TEST_DATABASE_URL } from './env'

/** Drops and recreates the test database so every run starts clean. */
export default async function setup() {
  const url = new URL(TEST_DATABASE_URL)
  const dbName = url.pathname.slice(1)
  if (!/test/.test(dbName)) throw new Error(`Refusing to reset "${dbName}" — test database names must contain "test".`)
  const admin = new URL(TEST_DATABASE_URL)
  admin.pathname = '/postgres'
  const client = new pg.Client({ connectionString: admin.toString() })
  await client.connect()
  await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`)
  await client.query(`CREATE DATABASE "${dbName}"`)
  await client.end()
}
