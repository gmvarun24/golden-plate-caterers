'use client'

import { createContext, useContext, useId, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

type FieldContextValue = { id: string; describedBy?: string; invalid: boolean; required: boolean }

const FieldContext = createContext<FieldContextValue | null>(null)

/** Inputs call this to pick up id / aria-describedby / aria-invalid from the surrounding Field. */
export function useField() {
  return useContext(FieldContext)
}

type FieldProps = {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  /** Visually hide the label (still read by screen readers). */
  hideLabel?: boolean
  id?: string
  className?: string
  children: ReactNode
}

/** Label + control + hint + error, wired together for assistive tech (works with React Hook Form). */
export function Field({ label, hint, error, required = false, hideLabel, id, className, children }: FieldProps) {
  const autoId = useId()
  const fieldId = id ?? `field-${autoId}`
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <FieldContext.Provider value={{ id: fieldId, describedBy, invalid: Boolean(error), required }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={fieldId} className={cn('text-sm font-medium text-text', hideLabel && 'sr-only')}>
          {label}
          {required ? (
            <span className="text-accent" aria-hidden="true">
              {' '}*
            </span>
          ) : (
            <span className="font-normal text-text-muted"> (optional)</span>
          )}
        </label>
        {children}
        {hint && !error && (
          <p id={hintId} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}
