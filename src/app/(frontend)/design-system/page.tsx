import config from '@payload-config'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { Logo, LogoMark } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serverEnv } from '@/lib/env'

import { ComponentGallery } from './ComponentGallery'
import { ContrastGrid, Swatch } from './Swatches'
import { MotionDemo } from './MotionDemo'
import { Section } from './Section'

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
}

/** Dev: open. Production: admin login required (unless DESIGN_SYSTEM_PUBLIC=true). */
async function canView(): Promise<boolean> {
  if (serverEnv.NODE_ENV !== 'production' || serverEnv.DESIGN_SYSTEM_PUBLIC) return true
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await headers() })
    return Boolean(user)
  } catch {
    return false
  }
}

const PRIMITIVES = {
  Golds: ['gold-400', 'gold-500', 'gold-600', 'gold-700', 'champagne'],
  Supporting: ['leaf', 'sage', 'saffron', 'saffron-deep', 'chili', 'chili-deep', 'chili-light', 'clay'],
  Lights: ['ivory-50', 'ivory', 'cream', 'sand', 'sand-deep', 'stone', 'umber'],
  Darks: ['espresso', 'cocoa', 'walnut', 'walnut-light', 'taupe', 'mushroom', 'ink', 'parchment'],
} as const

const SEMANTIC_SURFACES = ['bg', 'bg-subtle', 'surface', 'surface-raised', 'surface-sunken'] as const
const SEMANTIC_FILLS = [
  'accent-fill',
  'accent-fill-hover',
  'accent-soft',
  'secondary-fill',
  'border',
  'border-strong',
  'border-input',
  'danger',
  'success',
  'warning',
] as const

const TYPE_SCALE = ['display', '5xl', '4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xs'] as const
const SPACING = ['1', '2', '3', '4', '6', '8', '12', '16', '24', '32'] as const
const RADII = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const
const SHADOWS = ['sm', 'md', 'lg', 'overlay', 'glow'] as const
const Z_INDEX = ['base', 'raised', 'sticky', 'header', 'overlay', 'drawer', 'modal', 'popover', 'toast', 'cursor', 'transition'] as const

export default async function DesignSystemPage() {
  if (!(await canView())) notFound()

  return (
    <main id="main" className="pb-(--spacing-section)">
      <header className="sticky top-0 z-(--z-header) border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="container-wide flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="size-8" />
            <span className="eyebrow text-text-muted">Design system</span>
          </div>
          <nav aria-label="Sections" className="hidden gap-6 text-sm md:flex">
            {['brand', 'colour', 'type', 'space', 'motion', 'components'].map((id) => (
              <a key={id} href={`#${id}`} className="capitalize text-text-muted hover:text-accent">
                {id}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <div className="container-wide flex flex-col gap-(--spacing-section) pt-16">
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="eyebrow text-accent">Golden Plate · Foundations</p>
          <h1 className="text-display leading-tight tracking-display">
            Served <em className="text-accent-display">in gold</em>.
          </h1>
          <p className="text-lg text-text-muted">
            Every token and component, in both themes. Tokens live in{' '}
            <code className="font-mono text-sm">src/styles/tokens.css</code>; components in{' '}
            <code className="font-mono text-sm">src/components/ui</code>.
          </p>
        </div>

        <Section id="brand" title="Brand" lead="Generated from the brand fonts (npm run generate:logo). Swap the files in /public/brand or upload in Brand Settings.">
          <div className="grid gap-4 md:grid-cols-2">
            {(['light', 'dark'] as const).map((t) => (
              <div key={t} data-theme={t} className="flex flex-col items-start gap-8 rounded-lg border border-border p-8">
                <span className="eyebrow text-text-muted">{t}</span>
                <Logo className="h-14 w-auto" />
                <div className="flex items-center gap-6">
                  <LogoMark className="size-16" />
                  <LogoMark className="size-10" />
                  <LogoMark mono className="size-10 text-text" />
                  <Logo mono className="h-8 w-auto text-text-muted" />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="colour" title="Colour" lead="Primitives are raw brand values (not available to components). Components use semantic tokens, which switch per theme.">
          <div className="flex flex-col gap-8">
            {Object.entries(PRIMITIVES).map(([group, names]) => (
              <div key={group} className="flex flex-col gap-3">
                <h3 className="eyebrow text-text-muted">{group}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                  {names.map((n) => (
                    <Swatch key={n} name={n} cssVar={`--palette-${n}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {(['light', 'dark'] as const).map((t) => (
              <div key={t} data-theme={t} className="flex flex-col gap-6 rounded-lg border border-border p-6">
                <span className="eyebrow text-text-muted">Semantic · {t}</span>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {[...SEMANTIC_SURFACES, ...SEMANTIC_FILLS].map((n) => (
                    <Swatch key={n} name={n} cssVar={`--color-${n}`} compact />
                  ))}
                </div>
                <div aria-hidden="true" className="h-2 rounded-full bg-gradient-gold" />
                <ContrastGrid />
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Typography" lead="Fraunces (display) and Inter Tight (body), fluid from 360px to 1440px viewports. Resize the window to see the scale move.">
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {TYPE_SCALE.map((size) => (
              <div key={size} className="grid items-baseline gap-2 py-5 md:grid-cols-[8rem_1fr]">
                <code className="font-mono text-xs text-text-muted">text-{size}</code>
                <p
                  className={size === 'base' || size === 'sm' || size === 'xs' || size === 'lg' ? 'font-body' : 'font-display tracking-tight'}
                  style={{ fontSize: `var(--text-${size})`, lineHeight: `var(--text-${size}--line-height)` }}
                >
                  {size === 'display' ? 'Gruhapravesha' : size.endsWith('xl') ? 'Wedding reception for 300' : 'Banana-leaf service with payasam, ₹1,450 per plate, 14 Dec 2026.'}
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-md border border-border p-5">
              <span className="eyebrow text-accent">Eyebrow · caps 0.24em</span>
              <span className="font-display text-3xl italic">Italic display</span>
              <span className="text-sm text-text-muted">Weights 300 · 400 · 500 · 600</span>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-border p-5">
              <span className="tabular text-3xl">₹1,50,000</span>
              <span className="text-sm text-text-muted">Tabular, lining numerals for prices</span>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-border p-5 font-display text-2xl">
              <span className="font-light">Light 300</span>
              <span className="font-normal">Regular 400</span>
              <span className="font-semibold">Semibold 600</span>
            </div>
          </div>
        </Section>

        <Section id="space" title="Space, shape & depth">
          <div className="flex flex-col gap-3">
            <h3 className="eyebrow text-text-muted">Spacing (×0.25rem)</h3>
            <div className="flex flex-wrap items-end gap-4">
              {SPACING.map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <div className="bg-accent-fill" style={{ width: `calc(var(--spacing) * ${s})`, height: `calc(var(--spacing) * ${s})` }} />
                  <code className="font-mono text-xs text-text-muted">{s}</code>
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <div className="h-3 w-(--spacing-gutter) bg-secondary-fill" />
                <code className="font-mono text-xs text-text-muted">gutter</code>
              </div>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="eyebrow text-text-muted">Radii</h3>
              <div className="flex flex-wrap gap-4">
                {RADII.map((r) => (
                  <div key={r} className="flex flex-col items-center gap-2">
                    <div className="size-16 border border-border-accent bg-surface" style={{ borderRadius: `var(--radius-${r})` }} />
                    <code className="font-mono text-xs text-text-muted">{r}</code>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="eyebrow text-text-muted">Elevation (glows in dark)</h3>
              <div className="flex flex-wrap gap-5">
                {SHADOWS.map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <div className="size-16 rounded-md bg-surface-raised" style={{ boxShadow: `var(--shadow-${s})` }} />
                    <code className="font-mono text-xs text-text-muted">{s}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="eyebrow text-text-muted">Z-index scale</h3>
            <ol className="flex flex-wrap gap-2 text-sm">
              {Z_INDEX.map((z) => (
                <li key={z} className="rounded-full border border-border px-3 py-1">
                  {z} <span className="text-text-muted tabular">· {`var(--z-${z})`}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <Section id="motion" title="Motion" lead="Durations and curves. Everything collapses to near-instant under prefers-reduced-motion.">
          <MotionDemo />
        </Section>

        <Section id="components" title="Components" lead="Every component in both themes. Tab through to check focus states.">
          <div className="grid gap-4 2xl:grid-cols-2">
            <div data-theme="light" className="rounded-lg border border-border p-5 sm:p-8">
              <p className="eyebrow mb-6 text-text-muted">Light</p>
              <ComponentGallery idPrefix="light" />
            </div>
            <div data-theme="dark" className="rounded-lg border border-border p-5 sm:p-8">
              <p className="eyebrow mb-6 text-text-muted">Dark</p>
              <ComponentGallery idPrefix="dark" />
            </div>
          </div>
        </Section>
      </div>
    </main>
  )
}
