'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { submitEnquiry } from '@/app/(frontend)/(site)/actions'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field } from '@/components/ui/Field'
import { Input, PhoneInput, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { track } from '@/lib/analytics'
import { enquirySchema, type EnquiryData, type EnquiryInput, type SelectionInput } from '@/lib/validation/enquiry'

import { readSource } from './SourceCapture'

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s: string | undefined) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : undefined)

type Props = {
  occasions: { slug: string; name: string }[]
  defaults?: Partial<EnquiryInput>
  /** Package enquiry: the customiser's selection (prices are recomputed on the server). */
  selection?: SelectionInput
  /** Guest count is controlled by the customiser — shown read-only here. */
  lockedGuests?: number
  /** Called before navigating to the quote page (e.g. clear the saved selection). */
  onSubmitted?: () => void
  submitLabel?: string
}

export function EnquiryForm({ occasions, defaults, selection, lockedGuests, onSubmitted, submitLabel = 'Send enquiry' }: Props) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<EnquiryInput, unknown, EnquiryData>({
    resolver: zodResolver(enquirySchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      eventType: '',
      eventDate: '',
      area: '',
      notes: '',
      website: '',
      ...defaults,
      guests: lockedGuests ?? defaults?.guests ?? '',
    } as EnquiryInput,
  })
  const { register, control, handleSubmit, setError, formState } = form
  const err = (name: keyof EnquiryInput) => formState.errors[name]?.message as string | undefined

  const onSubmit = handleSubmit((values) => {
    setFormError(null)
    startTransition(async () => {
      const result = await submitEnquiry({
        enquiry: { ...values, guests: lockedGuests ?? values.guests },
        selection,
        source: readSource(),
      })
      if (result.ok) {
        track('enquiry_submit', { type: selection ? 'package' : 'general', package: selection?.packageSlug ?? 'none' })
        onSubmitted?.()
        router.push(result.path)
        return
      }
      setFormError(result.error)
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        if (field in values) setError(field as keyof EnquiryInput, { message })
      }
    })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-describedby={formError ? 'enquiry-error' : undefined}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={err('name')}>
          <Input autoComplete="name" {...register('name')} />
        </Field>
        <Field label="Mobile number" required error={err('phone')} hint="We’ll call you on this number.">
          <PhoneInput {...register('phone')} />
        </Field>
        <Field label="Email" error={err('email')} hint="For a copy of your quote.">
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </Field>
        <Field label="Occasion" error={err('eventType')}>
          <Controller
            control={control}
            name="eventType"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                placeholder="Choose an occasion"
                options={occasions.map((o) => ({ value: o.slug, label: o.name }))}
              />
            )}
          />
        </Field>
        <Field label="Event date" required error={err('eventDate')}>
          <Controller
            control={control}
            name="eventDate"
            render={({ field }) => (
              <DatePicker value={fromIso(field.value)} onChange={(d) => field.onChange(d ? toIso(d) : '')} />
            )}
          />
        </Field>
        <Field label="Area / locality" required error={err('area')}>
          <Input autoComplete="address-level3" placeholder="e.g. Jayanagar" {...register('area')} />
        </Field>
        <Field
          label="Guests"
          required
          error={err('guests')}
          hint={lockedGuests ? 'From your menu selection — change it there.' : undefined}
        >
          <Input inputMode="numeric" readOnly={Boolean(lockedGuests)} aria-readonly={Boolean(lockedGuests)} {...register('guests')} />
        </Field>
      </div>
      <Field label="Anything else we should know?" error={err('notes')}>
        <Textarea placeholder="Dietary needs, venue, timings, service style…" {...register('notes')} />
      </Field>

      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      <Controller
        control={control}
        name="consent"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={field.value === true}
                onCheckedChange={(v) => field.onChange(v === true ? true : undefined)}
                aria-invalid={Boolean(err('consent')) || undefined}
                aria-describedby={err('consent') ? 'consent-error' : undefined}
                className="mt-0.5"
              />
              <span>
                I agree to be contacted about this enquiry and accept the{' '}
                <NextLink href="/privacy" target="_blank" className="text-accent underline underline-offset-4">
                  privacy policy
                </NextLink>
                .
              </span>
            </label>
            {err('consent') && (
              <p id="consent-error" role="alert" className="text-xs font-medium text-danger">
                {err('consent')}
              </p>
            )}
          </div>
        )}
      />

      {formError && (
        <p id="enquiry-error" role="alert" className="rounded-md border border-danger/40 bg-bg-subtle p-3 text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full sm:w-auto sm:self-start">
        {submitLabel}
      </Button>
      <p className="text-xs text-text-muted">No payment is taken online. We’ll call you to confirm everything.</p>
    </form>
  )
}
