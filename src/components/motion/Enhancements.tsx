'use client'

import { SourceCapture } from '@/components/enquiry/SourceCapture'
import { Analytics } from '@/components/analytics/Analytics'

import { Cursor } from './Cursor'
import { HashAligner } from './HashAligner'
import { RevealObserver } from './RevealObserver'
import { SmoothScroll } from './SmoothScroll'

/** Non-critical client behaviour, bundled together and loaded after the page is interactive. */
export default function Enhancements() {
  return (
    <>
      <SourceCapture />
      <SmoothScroll />
      <HashAligner />
      <RevealObserver />
      <Cursor />
      <Analytics />
    </>
  )
}
