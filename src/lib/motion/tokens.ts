/**
 * JS mirror of the motion tokens in src/styles/tokens.css, for Motion / GSAP (which need
 * numbers, not CSS strings). `tests/unit/motion-tokens.test.ts` fails if the two drift.
 */
export const duration = {
  instant: 100,
  fast: 180,
  base: 280,
  slow: 480,
  slower: 800,
  ambient: 12_000,
} as const

export const stagger = {
  xs: 30,
  sm: 60,
  md: 90,
} as const

/** Cubic-bezier control points, usable as Motion `ease` arrays or GSAP CustomEase strings. */
export const ease = {
  standard: [0.2, 0, 0, 1],
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  springSoft: [0.34, 1.36, 0.64, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>

/** Durations in seconds, for Motion's `transition.duration`. */
export const seconds = (ms: number): number => ms / 1000
