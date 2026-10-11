import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { cn } from '@/lib/cn'

/** Payload rich text with editorial typography. */
export function RichText({ data, className }: { data: SerializedEditorState; className?: string }) {
  return (
    <LexicalRichText
      data={data}
      className={cn(
        'max-w-prose text-lg text-text-muted [&_a]:text-accent [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:text-text [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:text-text [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:text-text [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6',
        className,
      )}
    />
  )
}
