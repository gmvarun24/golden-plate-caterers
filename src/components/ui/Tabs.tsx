'use client'

import { Tabs as RadixTabs } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

export const Tabs = RadixTabs.Root

export function TabsList({ className, ...props }: ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn('flex gap-6 overflow-x-auto border-b border-border [scrollbar-width:none]', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'relative -mb-px h-12 shrink-0 px-0.5 text-base font-medium whitespace-nowrap text-text-muted transition-colors duration-(--duration-fast)',
        'hover:text-text data-[state=active]:text-text',
        // Gold underline that grows from the centre
        'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-accent-fill',
        'after:transition-transform after:duration-(--duration-base) after:ease-out-expo data-[state=active]:after:scale-x-100',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      className={cn('pt-6 data-[state=active]:animate-fade-in focus-visible:outline-offset-4', className)}
      {...props}
    />
  )
}
