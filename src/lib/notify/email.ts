import 'server-only'

import { serverEnv } from '@/lib/env'

export type EmailMessage = { to: string; subject: string; html: string; text: string; replyTo?: string }

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>
}

/** Development default: prints the email instead of sending it. */
class ConsoleEmail implements EmailProvider {
  async send(m: EmailMessage) {
    console.info(`\n📧 [email:console] to=${m.to} subject="${m.subject}"\n${m.text}\n`)
  }
}

/** Resend HTTP API (no SDK needed). */
class ResendEmail implements EmailProvider {
  constructor(private apiKey: string, private from: string) {}
  async send(m: EmailMessage) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: [m.to], subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo }),
    })
    if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`)
  }
}

/** Any SMTP server via Nodemailer (loaded lazily so other providers don't pay for it). */
class SmtpEmail implements EmailProvider {
  async send(m: EmailMessage) {
    const nodemailer = await import('nodemailer')
    const transport = nodemailer.createTransport({
      host: serverEnv.SMTP_HOST,
      port: serverEnv.SMTP_PORT,
      secure: serverEnv.SMTP_SECURE,
      auth: serverEnv.SMTP_USER ? { user: serverEnv.SMTP_USER, pass: serverEnv.SMTP_PASSWORD } : undefined,
    })
    await transport.sendMail({ from: serverEnv.EMAIL_FROM, to: m.to, subject: m.subject, html: m.html, text: m.text, replyTo: m.replyTo })
  }
}

export function getEmailProvider(): EmailProvider {
  switch (serverEnv.EMAIL_PROVIDER) {
    case 'resend':
      if (!serverEnv.RESEND_API_KEY) throw new Error('EMAIL_PROVIDER=resend needs RESEND_API_KEY')
      return new ResendEmail(serverEnv.RESEND_API_KEY, serverEnv.EMAIL_FROM)
    case 'smtp':
      if (!serverEnv.SMTP_HOST) throw new Error('EMAIL_PROVIDER=smtp needs SMTP_HOST')
      return new SmtpEmail()
    default:
      return new ConsoleEmail()
  }
}
