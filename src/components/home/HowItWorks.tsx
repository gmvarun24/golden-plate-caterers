import { PinnedSteps } from './PinnedSteps'
import { SectionHeading } from './SectionHeading'

const STEPS = [
  {
    title: 'Browse',
    body: 'Explore menus by occasion, cuisine, diet and budget — every price is shown per plate.',
  },
  {
    title: 'Customise',
    body: 'Choose dishes section by section, add live counters or staff, and watch your estimate update.',
  },
  {
    title: 'Get your reference',
    body: 'Send your selection and receive a quote reference like GPC-1026-0042 instantly.',
  },
  {
    title: 'We call you',
    body: 'Our team calls to fine-tune the menu and confirm the final price. No online payment, ever.',
  },
]

/** "How it works" — four steps. (Phase 5 pins this section and ties progress to scroll.) */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="scroll-mt-24 py-(--spacing-section) lg:flex lg:min-h-svh lg:items-center"
    >
      <PinnedSteps>
        <div className="container-wide flex flex-col gap-14">
          <SectionHeading
            id="how-title"
            eyebrow="How it works"
            title={
              <>
                From first look to <em className="text-accent-display italic">last plate</em>
              </>
            }
            lead="Four simple steps. You are never asked to pay online."
          />
          <div className="relative">
            {/* Gold progress line (desktop pinned scene fills it as you scroll) */}
            <div aria-hidden="true" className="absolute top-0 right-0 left-0 hidden h-px bg-border lg:block">
              <div
                data-step-progress
                className="bg-gradient-gold h-full origin-left scale-x-0 motion-reduce:scale-x-100"
              />
            </div>
            <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  data-step
                  data-reveal="fade-up"
                  style={{ '--i': i } as React.CSSProperties}
                  className="relative flex flex-col gap-4 border-t border-border pt-6 lg:border-t-0"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-16 place-items-center rounded-full border border-accent-fill font-display text-2xl text-accent-display shadow-[inset_0_0_0_6px_var(--color-bg),inset_0_0_0_7px_var(--color-border-accent)]"
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-3xl">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="text-text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </PinnedSteps>
    </section>
  )
}
