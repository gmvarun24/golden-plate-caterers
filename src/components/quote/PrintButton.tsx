'use client'

import { Button } from '@/components/ui/Button'
import { DownloadIcon } from '@/components/ui/icons'

/** Opens the browser print dialog — "Save as PDF" is the destination most people pick. */
export function PrintButton() {
  return (
    <Button variant="secondary" className="no-print" onClick={() => window.print()}>
      <DownloadIcon /> Download PDF
    </Button>
  )
}
