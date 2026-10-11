'use client'

import dynamic from 'next/dynamic'
import { Popover } from 'radix-ui'
import { useState } from 'react'

import { cn } from '@/lib/cn'
import { useMediaQuery } from '@/lib/hooks/use-media-query'

import { useField } from './Field'
import { CalendarIcon } from './icons'
import { Drawer } from './Modal'
import { Spinner } from './Spinner'

/** Calendar code (~30 KB) loads the first time a picker opens, not with the page. */
const Calendar = dynamic(() => import('./Calendar'), {
  ssr: false,
  loading: () => (
    <div className="grid h-80 w-80 place-items-center text-accent">
      <Spinner label="Loading calendar" />
    </div>
  ),
})

type DatePickerProps = {
  value?: Date
  onChange: (date: Date | undefined) => void
  /** Earliest selectable date (defaults to today). */
  fromDate?: Date
  placeholder?: string
  className?: string
  disabled?: boolean
}

const dateLabel = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Event-date picker. A popover on desktop; a bottom sheet with large tap targets on phones.
 * Full keyboard support comes from react-day-picker (arrows, PageUp/Down, Home/End).
 */
export function DatePicker({ value, onChange, fromDate, placeholder = 'Choose a date', className, disabled }: DatePickerProps) {
  const field = useField()
  const [open, setOpen] = useState(false)
  const isPhone = useMediaQuery('(max-width: 47.99rem)')
  const min = fromDate ?? startOfToday()

  const calendar = (
    <Calendar
      value={value}
      min={min}
      large={isPhone}
      onSelect={(d) => {
        onChange(d)
        if (d) setOpen(false)
      }}
    />
  )

  const trigger = (
    <button
      type="button"
      id={field?.id}
      aria-describedby={field?.describedBy}
      data-invalid={field?.invalid || undefined}
      aria-haspopup="dialog"
      disabled={disabled}
      onClick={isPhone ? () => setOpen(true) : undefined}
      // Warm the calendar chunk before the click lands.
      onPointerEnter={() => void import('./Calendar')}
      onFocus={() => void import('./Calendar')}
      className={cn(
        'flex h-12 w-full items-center justify-between gap-3 rounded-md border border-border-input bg-surface px-4 text-left text-base',
        'transition-[border-color] duration-(--duration-fast) hover:border-text-muted',
        'focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/30',
        'data-[invalid=true]:border-danger disabled:opacity-60',
        value ? 'text-text' : 'text-text-muted',
        className,
      )}
    >
      <span>{value ? dateLabel.format(value) : placeholder}</span>
      <CalendarIcon className="size-5 text-text-muted" />
    </button>
  )

  if (isPhone) {
    return (
      <>
        {trigger}
        <Drawer side="bottom" open={open} onOpenChange={setOpen} title="Event date" description="Pick the day of your event.">
          <div className="flex justify-center">{calendar}</div>
        </Drawer>
      </>
    )
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-(--z-popover) rounded-md border border-border bg-surface-raised p-3 text-text shadow-overlay data-[state=open]:animate-rise-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-fade-out"
        >
          {calendar}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
