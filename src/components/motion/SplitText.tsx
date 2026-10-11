import { Fragment } from 'react'

/**
 * Splits a headline into masked words for the reveal animation. `*words*` render in gold italics
 * (same convention as the CMS). Screen readers read the plain sentence once; the animated words are aria-hidden.
 *   mode="load"   → animates on page load (hero)
 *   mode="scroll" → animates when scrolled into view
 */
export function SplitText({ text, mode = 'scroll', className }: { text: string; mode?: 'load' | 'scroll'; className?: string }) {
  const plain = text.replace(/\*/g, '')
  let i = 0
  const segments = text.split(/(\*[^*]+\*)/g).filter(Boolean)
  return (
    <span
      className={[mode === 'load' ? 'split-load' : undefined, className].filter(Boolean).join(' ') || undefined}
      {...(mode === 'scroll' ? { 'data-reveal': 'words' } : {})}
    >
      <span className="sr-only">{plain}</span>
      {segments.map((seg, s) => {
        const emphasis = seg.startsWith('*') && seg.endsWith('*')
        const words = (emphasis ? seg.slice(1, -1) : seg).split(/(\s+)/)
        const content = words.map((w, k) =>
          /^\s+$/.test(w) || w === '' ? (
            <span key={k} aria-hidden="true">
              {w}
            </span>
          ) : (
            <span key={k} aria-hidden="true" className="split-word">
              <span style={{ '--i': i++ } as React.CSSProperties}>{w}</span>
            </span>
          ),
        )
        return emphasis ? (
          <em key={s} aria-hidden="true" className="text-accent-display italic">
            {content}
          </em>
        ) : (
          <Fragment key={s}>{content}</Fragment>
        )
      })}
    </span>
  )
}
