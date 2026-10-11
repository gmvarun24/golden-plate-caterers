/** CSV helpers (RFC 4180) with spreadsheet-formula injection protection. Pure — unit tested. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let s = String(value)
  // Neutralise values a spreadsheet would execute as a formula (=, +, -, @, tab, CR).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
