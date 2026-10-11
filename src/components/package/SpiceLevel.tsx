const LABEL = ['Not spicy', 'Mild', 'Medium', 'Hot'] as const

/** Three small chilli dots; filled = level. Text alternative for screen readers. */
export function SpiceLevel({ level }: { level: 0 | 1 | 2 | 3 }) {
  if (level === 0) return null
  return (
    <span className="inline-flex items-center gap-0.5" title={LABEL[level]}>
      {[1, 2, 3].map((i) => (
        <span key={i} aria-hidden="true" className={`size-1.5 rounded-full ${i <= level ? 'bg-danger' : 'bg-border-strong'}`} />
      ))}
      <span className="sr-only">{LABEL[level]}</span>
    </span>
  )
}
