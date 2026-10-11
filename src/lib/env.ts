/**
 * Server environment, validated once at startup. Fails fast with a readable message
 * instead of a mysterious runtime error. Later phases add their variables here.
 */
import { z } from 'zod'

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (see .env.example)'),
  PAYLOAD_SECRET: z.string().min(16, 'PAYLOAD_SECRET must be at least 16 characters'),
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  DESIGN_SYSTEM_PUBLIC: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // Email
  EMAIL_PROVIDER: z.enum(['console', 'resend', 'smtp']).default('console'),
  EMAIL_FROM: z.string().default('Golden Plate Caterers <hello@example.com>'),
  ADMIN_NOTIFY_EMAIL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // Optional admin WhatsApp notification via a provider webhook
  WHATSAPP_NOTIFY_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  WHATSAPP_WEBHOOK_URL: z.string().optional(),
  WHATSAPP_WEBHOOK_TOKEN: z.string().optional(),
  WHATSAPP_ADMIN_NUMBER: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_SALT: z.string().default('dev-only-salt-change-me'),
})

function parseServerEnv() {
  // Empty strings in .env mean "not set".
  const env = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ''))
  const parsed = serverSchema.safeParse(env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment variables:\n${issues}\n\nCopy .env.example to .env and fill it in.`)
  }
  const data = parsed.data
  if (data.NODE_ENV === 'production' && data.RATE_LIMIT_SALT === 'dev-only-salt-change-me') {
    console.warn('[env] RATE_LIMIT_SALT is not set — using a development default.')
  }
  return data
}

export const serverEnv = parseServerEnv()
