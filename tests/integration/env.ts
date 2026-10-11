import 'dotenv/config'

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || (process.env.DATABASE_URL ?? '').replace(/\/[^/?]+(\?|$)/, '/golden_plate_test$1')
