'use client'

/**
 * The heavy part of DatePicker (react-day-picker + date-fns locale), split into its own chunk and
 * loaded only when a picker is first opened.
 */
import { DayPicker } from 'react-day-picker'
import { enIN } from 'react-day-picker/locale'
import 'react-day-picker/style.css'

import { cn } from '@/lib/cn'

import styles from './DatePicker.module.css'

type Props = {
  value?: Date
  min: Date
  large?: boolean
  onSelect: (d: Date | undefined) => void
}

export default function Calendar({ value, min, large, onSelect }: Props) {
  return (
    <DayPicker
      mode="single"
      locale={enIN}
      weekStartsOn={1}
      selected={value}
      defaultMonth={value ?? min}
      startMonth={min}
      disabled={{ before: min }}
      onSelect={onSelect}
      className={cn(styles.calendar, large && styles.large)}
      autoFocus
    />
  )
}
