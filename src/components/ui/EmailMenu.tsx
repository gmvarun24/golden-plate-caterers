'use client'

import { DropdownMenu } from 'radix-ui'
import type { ReactNode } from 'react'

import { track } from '@/lib/analytics'
import { cn } from '@/lib/cn'
import { gmailComposeHref, mailtoHref } from '@/lib/contact'

import { ArrowUpRightIcon, CopyIcon, MailIcon } from './icons'
import { toast } from './toast'

type EmailMenuProps = {
  email: string
  subject?: string
  body?: string
  /** Styles for the trigger, so it can look like the button or link it replaces. */
  className?: string
  /** Extra analytics params, e.g. `{ location: 'quote' }`. Never personal data. */
  trackParams?: Record<string, string>
  children: ReactNode
}

const itemClass = cn(
  'flex h-11 cursor-pointer items-center gap-3 rounded-sm px-3 text-base text-text outline-none select-none',
  'data-[highlighted]:bg-accent-soft [&_svg]:size-4.5 [&_svg]:shrink-0 [&_svg]:text-accent',
)

/**
 * An email contact that never dead-ends. A bare `mailto:` does nothing on computers with no mail
 * app set up (common for Gmail-in-the-browser users), so this opens a small menu instead: Gmail
 * in the browser, the device's mail app, or copy the address.
 */
export function EmailMenu({ email, subject, body, className, trackParams, children }: EmailMenuProps) {
  const record = (method: string) =>
    track('email_click', { method, path: window.location.pathname, ...trackParams })

  const copy = async () => {
    record('copy')
    try {
      await navigator.clipboard.writeText(email)
      toast.success('Email address copied', { description: email })
    } catch {
      toast.error('Couldn’t copy automatically', { description: email })
    }
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className={cn('cursor-pointer', className)}>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className={cn(
            'z-(--z-popover) min-w-60 rounded-md border border-border bg-surface-raised p-1.5 text-text shadow-overlay',
            'data-[state=closed]:pointer-events-none data-[state=closed]:animate-fade-out data-[state=open]:animate-rise-in',
          )}
        >
          <DropdownMenu.Label className="truncate px-3 pt-1.5 pb-2 text-sm text-text-muted">
            {email}
          </DropdownMenu.Label>
          <DropdownMenu.Item asChild className={itemClass} onSelect={() => record('gmail')}>
            <a href={gmailComposeHref(email, subject, body)} target="_blank" rel="noopener noreferrer">
              <ArrowUpRightIcon /> Open in Gmail
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={itemClass} onSelect={() => record('mail_app')}>
            <a href={mailtoHref(email, subject, body)}>
              <MailIcon /> Open email app
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClass} onSelect={copy}>
            <CopyIcon /> Copy address
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
