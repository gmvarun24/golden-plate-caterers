'use server'

import { submitEnquiry as submit, type SubmitResult } from '@/lib/enquiry/submit'

/** Server Action wrapper — the logic lives in src/lib/enquiry/submit.ts. */
export async function submitEnquiry(raw: unknown): Promise<SubmitResult> {
  return submit(raw)
}
