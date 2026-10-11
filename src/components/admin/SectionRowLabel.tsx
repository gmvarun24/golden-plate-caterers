'use client'

import { useRowLabel } from '@payloadcms/ui'

type Row = { title?: string; rule?: { min?: number; max?: number }; items?: unknown[] }

/** "Starters — choose 2–3 of 8" in the package editor's section list. */
export function SectionRowLabel() {
  const { data, rowNumber } = useRowLabel<Row>()
  const count = data?.items?.length ?? 0
  const min = data?.rule?.min ?? 0
  const max = data?.rule?.max ?? 0
  const rule = min === max ? `choose ${max}` : `choose ${min}–${max}`
  return (
    <span>
      {data?.title || `Section ${(rowNumber ?? 0) + 1}`}
      <span style={{ opacity: 0.6 }}> — {rule} of {count}</span>
    </span>
  )
}
