'use client'

import { Accordion as RadixAccordion } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { PlusIcon } from './icons'

export function Accordion({ className, ...props }: ComponentProps<typeof RadixAccordion.Root>) {
  return <RadixAccordion.Root className={cn('border-t border-border', className)} {...props} />
}

type AccordionItemProps = Omit<ComponentProps<typeof RadixAccordion.Item>, 'title'> & {
  title: ReactNode
  /** Heading level for the trigger (keeps document outline correct). */
  headingLevel?: 'h2' | 'h3' | 'h4'
}

/**
 * Content opens with a fade/rise (transform + opacity only); height snaps rather than animating
 * layout, per the performance budget.
 */
export function AccordionItem({ title, headingLevel = 'h3', children, className, ...props }: AccordionItemProps) {
  const Heading = headingLevel
  return (
    <RadixAccordion.Item className={cn('border-b border-border', className)} {...props}>
      <RadixAccordion.Header asChild>
        <Heading className="font-body text-lg font-medium tracking-normal">
          <RadixAccordion.Trigger className="group flex w-full items-center justify-between gap-6 py-5 text-left text-text transition-colors hover:text-accent">
            {title}
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border transition-[transform,border-color] duration-(--duration-slow) ease-out-expo group-hover:border-accent group-data-[state=open]:rotate-[135deg]">
              <PlusIcon className="size-4" />
            </span>
          </RadixAccordion.Trigger>
        </Heading>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="text-text-muted data-[state=open]:animate-rise-in">
        <div className="max-w-prose pb-6">{children}</div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  )
}
