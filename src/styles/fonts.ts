/**
 * Font loading. Swapping a typeface = change the import here + the `--font-display` /
 * `--font-body` fallback stacks in tokens.css. Variable names below are referenced there.
 * The ₹ sign comes from tiny one-glyph fonts (public/fonts/rupee-*.otf, `npm run generate:rupee`)
 * so prices never download the large latin-ext subsets.
 */
import { Fraunces, Inter_Tight } from 'next/font/google'

// Weight axis only: the optical-size/SOFT axes more than doubled the files. With CSS inlined,
// the face is discovered immediately, so it isn't preloaded (keeps it off the critical path).
export const fontDisplay = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: false,
  variable: '--font-fraunces',
})

export const fontBody = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
})

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable}`
