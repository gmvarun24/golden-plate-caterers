/**
 * Indian-rupee formatting. Amounts are whole rupees (integers) everywhere in the app.
 * `en-IN` gives lakh/crore grouping: 150000 → "1,50,000".
 */
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const grouped = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** "₹1,50,000" */
export function formatINR(amount: number): string {
  return inr.format(Math.round(amount))
}

/** "1,50,000" — digits only, for layouts that render the ₹ symbol separately. */
export function formatINRNumber(amount: number): string {
  return grouped.format(Math.round(amount))
}

/** "₹1.5L", "₹2.25Cr", "₹45K" — for compact spaces like filter chips. */
export function formatINRCompact(amount: number): string {
  const n = Math.round(amount)
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  const trim = (v: number) => v.toFixed(2).replace(/\.?0+$/, '')
  if (abs >= 1_00_00_000) return `${sign}₹${trim(abs / 1_00_00_000)}Cr`
  if (abs >= 1_00_000) return `${sign}₹${trim(abs / 1_00_000)}L`
  if (abs >= 1_000) return `${sign}₹${trim(abs / 1_000)}K`
  return `${sign}₹${abs}`
}

/** "₹450 / plate" */
export function formatPerPlate(amount: number): string {
  return `${formatINR(amount)} / plate`
}
