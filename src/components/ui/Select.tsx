'use client'

import { Select as RadixSelect } from 'radix-ui'

import { cn } from '@/lib/cn'

import { useField } from './Field'
import { CheckIcon, ChevronDownIcon } from './icons'

export type SelectOption = { value: string; label: string; disabled?: boolean }

type SelectProps = {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  name?: string
  disabled?: boolean
  className?: string
  /** For use outside a <Field> (pair with your own <label htmlFor>). */
  id?: string
}

export function Select({ options, placeholder = 'Select…', className, id, ...props }: SelectProps) {
  const field = useField()
  return (
    <RadixSelect.Root {...props} required={field?.required}>
      <RadixSelect.Trigger
        id={id ?? field?.id}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={cn(
          'group flex h-12 w-full items-center justify-between gap-2 rounded-md border border-border-input bg-surface px-4 text-left text-base text-text',
          'transition-[border-color] duration-(--duration-fast) hover:border-text-muted',
          'focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/30',
          'aria-[invalid=true]:border-danger data-[placeholder]:text-text-muted disabled:opacity-60',
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDownIcon className="size-5 text-text-muted transition-transform duration-(--duration-base) group-data-[state=open]:rotate-180" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className={cn(
            'z-(--z-popover) max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden',
            'rounded-md border border-border bg-surface-raised text-text shadow-overlay',
            'data-[state=open]:animate-rise-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-fade-out',
          )}
        >
          <RadixSelect.Viewport data-lenis-prevent className="p-1.5">
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className={cn(
                  'relative flex h-11 cursor-default select-none items-center rounded-sm pr-3 pl-9 text-base outline-none',
                  'data-[highlighted]:bg-accent-soft data-[highlighted]:text-text data-[disabled]:opacity-50',
                )}
              >
                <RadixSelect.ItemIndicator className="absolute left-3 inline-flex text-accent">
                  <CheckIcon className="size-4" />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
