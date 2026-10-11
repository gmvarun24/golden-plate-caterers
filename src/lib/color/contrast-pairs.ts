/**
 * Semantic colour pairs that must meet WCAG AA in BOTH themes. Checked by
 * `npm run check:contrast` (and the Vitest suite), and displayed live on /design-system.
 * min 4.5 = normal text; 3 = large text (≥24px, or ≥18.66px bold) or UI components/graphics.
 */
export type ContrastPair = { fg: string; bg: string; min: 4.5 | 3; note?: string }

const TEXT_ON = ['bg', 'bg-subtle', 'surface', 'surface-raised', 'surface-sunken'] as const

export const CONTRAST_PAIRS: ContrastPair[] = [
  ...TEXT_ON.flatMap((bg): ContrastPair[] => [
    { fg: 'text', bg, min: 4.5 },
    { fg: 'text-muted', bg, min: 4.5 },
    { fg: 'accent', bg, min: 4.5, note: 'links & accent text' },
    { fg: 'secondary', bg, min: 4.5 },
    { fg: 'danger', bg, min: 4.5, note: 'error messages' },
    { fg: 'accent-display', bg, min: 3, note: 'large display type only' },
    { fg: 'border-input', bg, min: 3, note: 'form control boundaries' },
    { fg: 'focus-ring', bg, min: 3, note: 'focus indicator' },
    { fg: 'diet-veg', bg, min: 3, note: 'diet mark (graphic)' },
    { fg: 'diet-nonveg', bg, min: 3, note: 'diet mark (graphic)' },
    { fg: 'diet-jain', bg, min: 3, note: 'diet mark (graphic)' },
  ]),
  { fg: 'on-accent', bg: 'accent-fill', min: 4.5, note: 'primary button' },
  { fg: 'on-accent', bg: 'accent-fill-hover', min: 4.5, note: 'primary button hover' },
  { fg: 'on-secondary', bg: 'secondary-fill', min: 4.5 },
  { fg: 'on-danger', bg: 'danger', min: 4.5 },
  { fg: 'text-inverse', bg: 'text', min: 4.5, note: 'inverted blocks' },
  { fg: 'text', bg: 'accent-soft', min: 4.5, note: 'selected chips / cards' },
  { fg: 'accent', bg: 'accent-soft', min: 4.5, note: 'accent badge' },
]
