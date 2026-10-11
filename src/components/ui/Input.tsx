'use client'

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

import { useField } from './Field'

/** Shared look for text-like controls. The native caret & cursor always stay visible. */
export const controlClass = cn(
  'w-full rounded-md border border-border-input bg-surface px-4 text-base text-text',
  'placeholder:text-text-muted transition-[border-color,box-shadow] duration-(--duration-fast) ease-standard',
  'hover:border-text-muted focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/30',
  'aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-60',
  'cursor-text',
)

function useFieldProps<T extends { id?: string; 'aria-describedby'?: string; required?: boolean }>(props: T) {
  const field = useField()
  return {
    id: props.id ?? field?.id,
    'aria-describedby': props['aria-describedby'] ?? field?.describedBy,
    'aria-invalid': field?.invalid || undefined,
    required: props.required ?? field?.required,
  }
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const fieldProps = useFieldProps(props)
  return <input data-cursor="text" className={cn(controlClass, 'h-12', className)} {...props} {...fieldProps} />
}

export function Textarea({ className, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldProps = useFieldProps(props)
  return (
    <textarea
      data-cursor="text"
      rows={rows}
      className={cn(controlClass, 'min-h-28 resize-y py-3', className)}
      {...props}
      {...fieldProps}
    />
  )
}

/** Indian mobile number with a fixed +91 prefix. Validation & E.164 normalisation live in Zod (Phase 4). */
export function PhoneInput({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const fieldProps = useFieldProps(props)
  return (
    <div className={cn('flex', className)}>
      <span
        className="inline-flex h-12 items-center rounded-l-md border border-r-0 border-border-input bg-bg-subtle px-3 text-base text-text-muted tabular"
        aria-hidden="true"
      >
        +91
      </span>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="98765 43210"
        maxLength={14}
        data-cursor="text"
        className={cn(controlClass, 'h-12 rounded-l-none tabular')}
        {...props}
        {...fieldProps}
      />
    </div>
  )
}
