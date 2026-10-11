'use client'

import { useState, type ReactNode } from 'react'

import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Badge, DietTag } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardDescription, CardFooter, CardMedia, CardTitle } from '@/components/ui/Card'
import { Checkbox, CheckboxCard } from '@/components/ui/Checkbox'
import { Chip, FilterChip } from '@/components/ui/Chip'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field } from '@/components/ui/Field'
import { ArrowRightIcon, PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'
import { Input, PhoneInput, Textarea } from '@/components/ui/Input'
import { Link } from '@/components/ui/Link'
import { Drawer, Modal, ModalClose } from '@/components/ui/Modal'
import { Price } from '@/components/ui/Price'
import { RadioCard, RadioCardGroup } from '@/components/ui/RadioCard'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { Stepper } from '@/components/ui/Stepper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/toast'

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="eyebrow text-text-muted">{title}</h3>
      {children}
    </div>
  )
}

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'reception', label: 'Wedding Reception' },
  { value: 'gruhapravesha', label: 'House Warming (Gruhapravesha)' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'corporate', label: 'Corporate event' },
]

/** Every UI component with its states. Rendered once per theme pane. */
export function ComponentGallery({ idPrefix }: { idPrefix: string }) {
  const [guests, setGuests] = useState(150)
  const [date, setDate] = useState<Date>()
  const [filters, setFilters] = useState<Record<string, boolean>>({ Veg: true, Jain: false, 'Non-veg': false })
  const [addOns, setAddOns] = useState<Record<string, boolean>>({ counter: true, staff: false })
  const [service, setService] = useState('buffet')

  return (
    <div className="flex flex-col gap-12">
      <Group title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Get my quote</Button>
          <Button variant="secondary">View menu</Button>
          <Button variant="leaf">
            <WhatsAppIcon /> WhatsApp us
          </Button>
          <Button variant="ghost">
            <PhoneIcon /> Call
          </Button>
          <Button variant="link">Read more</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="lg">
            Customise <ArrowRightIcon />
          </Button>
          <Button loading>Sending</Button>
          <Button disabled>Disabled</Button>
          <Button size="icon" variant="secondary" aria-label="Call us">
            <PhoneIcon />
          </Button>
        </div>
      </Group>

      <Group title="Links, badges & chips">
        <p className="max-w-prose">
          Read our <Link href="/privacy">privacy policy</Link> or follow us on{' '}
          <Link href="https://instagram.com">Instagram</Link>. Footer style:{' '}
          <Link variant="nav" href="/menus">
            Menus
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          <DietTag diet="veg" />
          <DietTag diet="non-veg" />
          <DietTag diet="jain" />
          <DietTag diet="mixed" />
          <Badge>Udupi</Badge>
          <Badge variant="accent">Featured</Badge>
          <Badge variant="premium">Premium</Badge>
          <Badge variant="secondary">Banana leaf</Badge>
          <Badge variant="outline">Serves 50–500</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip>South Indian</Chip>
          {Object.keys(filters).map((k) => (
            <FilterChip key={k} selected={Boolean(filters[k])} onSelectedChange={(v) => setFilters((f) => ({ ...f, [k]: v }))}>
              {k}
            </FilterChip>
          ))}
        </div>
      </Group>

      <Group title="Price (en-IN)">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <Price amount={450} per="plate" prefix="from" />
          <Price amount={150000} size="xl" />
          <Price amount={1250000} compact />
          <Price amount={67500} size="lg" />
        </div>
      </Group>

      <Group title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card interactive data-cursor="view">
            <CardMedia className="grid place-items-center bg-gradient-gold">
              <span className="font-display text-2xl text-on-accent">image</span>
            </CardMedia>
            <CardBody>
              <div className="flex gap-2">
                <DietTag diet="veg" />
                <Badge variant="outline">Udupi</Badge>
              </div>
              <CardTitle>
                <a href="#components" className="after:absolute after:inset-0 focus-visible:outline-none">
                  Gruhapravesha Grand Sadya
                </a>
              </CardTitle>
              <CardDescription>24 dishes on banana leaf, with payasam and live dosa counter.</CardDescription>
            </CardBody>
            <CardFooter>
              <Price amount={650} per="plate" prefix="from" />
            </CardFooter>
          </Card>
          <Card>
            <Skeleton className="aspect-[4/3] rounded-none" />
            <CardBody>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardBody>
          </Card>
        </div>
      </Group>

      <Group title="Form controls">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" required>
            <Input placeholder="Ananya Rao" autoComplete="name" />
          </Field>
          <Field label="Mobile number" required hint="We'll call you on this number.">
            <PhoneInput />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field label="Area / locality" required error="Please tell us where the event is.">
            <Input placeholder="e.g. Jayanagar" />
          </Field>
          <Field label="Event type" required>
            <Select options={EVENT_TYPES} placeholder="Choose an occasion" />
          </Field>
          <Field label="Event date" required>
            <DatePicker value={date} onChange={setDate} />
          </Field>
          <Field label="Guests" required hint="Between 50 and 1,000">
            <Stepper value={guests} onChange={setGuests} min={50} max={1000} step={10} unit="guests" />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea placeholder="Anything we should know: dietary needs, venue access, timings…" />
          </Field>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox id={`${idPrefix}-consent`} defaultChecked className="mt-0.5" />
          <span>
            I agree to be contacted about my enquiry and accept the <Link href="/privacy">privacy policy</Link>.
          </span>
        </label>
      </Group>

      <Group title="Selection cards">
        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxCard
            title="Live dosa counter"
            description="Chef-run counter with 4 varieties"
            meta={<Price amount={45} per="plate" size="sm" />}
            checked={addOns.counter}
            onCheckedChange={(v) => setAddOns((a) => ({ ...a, counter: v === true }))}
          />
          <CheckboxCard
            title="Service staff (6)"
            description="Uniformed servers for 4 hours"
            meta={<Price amount={9000} size="sm" />}
            checked={addOns.staff}
            onCheckedChange={(v) => setAddOns((a) => ({ ...a, staff: v === true }))}
          />
          <CheckboxCard title="Valet parking" description="Not available for this venue" disabled />
        </div>
        <RadioCardGroup value={service} onValueChange={setService} aria-label="Service style" className="sm:grid-cols-2">
          <RadioCard value="buffet" title="Buffet" description="Guests serve themselves" />
          <RadioCard value="leaf" title="Banana-leaf service" description="Seated, served course by course" meta="+₹60" />
        </RadioCardGroup>
      </Group>

      <Group title="Tabs & accordion">
        <Tabs defaultValue="menu">
          <TabsList>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>
          <TabsContent value="menu">Starters, mains, rice, breads and two desserts.</TabsContent>
          <TabsContent value="addons">Live counters, beverages, decor and service staff.</TabsContent>
          <TabsContent value="pricing">Per-plate price drops as your guest count grows.</TabsContent>
        </Tabs>
        <Accordion type="single" collapsible>
          <AccordionItem value="a" title="How is the price calculated?">
            Your per-plate price depends on the guest-count tier, plus any premium dishes and add-ons. The total
            is an indicative estimate; we confirm the final price on a call.
          </AccordionItem>
          <AccordionItem value="b" title="Do I pay online?">
            No. There is no online payment. We call you, finalise the menu together, and agree payment in person.
          </AccordionItem>
        </Accordion>
      </Group>

      <Group title="Overlays, toast & loading">
        <div className="flex flex-wrap items-center gap-3">
          <Modal
            trigger={<Button variant="secondary">Open modal</Button>}
            title="Send your enquiry"
            description="We'll call you within one business day."
            footer={
              <>
                <ModalClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </ModalClose>
                <ModalClose asChild>
                  <Button>Confirm</Button>
                </ModalClose>
              </>
            }
          >
            <Field label="Your name" required>
              <Input />
            </Field>
          </Modal>
          <Drawer trigger={<Button variant="secondary">Side drawer</Button>} title="Your selection">
            <p className="text-text-muted">The price summary lives here on desktop.</p>
          </Drawer>
          <Drawer side="bottom" trigger={<Button variant="secondary">Bottom sheet</Button>} title="Your estimate">
            <Price amount={187500} size="xl" />
            <p className="text-sm text-text-muted">Indicative estimate — final price confirmed on call.</p>
          </Drawer>
          <Button variant="ghost" onClick={() => toast.success('Reference copied', { description: 'GPC-1026-0042' })}>
            Show toast
          </Button>
          <Spinner className="text-accent" />
        </div>
      </Group>
    </div>
  )
}
