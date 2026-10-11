import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { runSeed } from '../../scripts/seed/index'

let ready: Promise<Payload> | null = null

/** One Payload instance per test file, seeded once per run. */
export function seededPayload(): Promise<Payload> {
  ready ??= (async () => {
    const payload = await getPayload({ config })
    const { totalDocs } = await payload.count({ collection: 'packages', overrideAccess: true })
    if (totalDocs === 0) await runSeed(payload)
    // The first account ever created is forced to "owner"; create it here so test users get the role they ask for.
    const users = await payload.count({ collection: 'users', overrideAccess: true })
    if (users.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: { email: 'owner@test.local', password: 'test-pass-123', name: 'Owner', role: 'owner' },
        overrideAccess: true,
      })
    }
    return payload
  })()
  return ready
}
