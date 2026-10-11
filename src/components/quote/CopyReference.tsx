'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { CheckIcon } from '@/components/ui/icons'
import { toast } from '@/components/ui/toast'

export function CopyReference({ referenceId }: { referenceId: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referenceId)
      setCopied(true)
      toast.success('Reference copied', { description: referenceId })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Copy not available', { description: `Your reference is ${referenceId}` })
    }
  }
  return (
    <Button variant="secondary" size="sm" onClick={copy} className="no-print" aria-label={`Copy reference ${referenceId}`}>
      {copied ? <CheckIcon /> : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
      )}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}
