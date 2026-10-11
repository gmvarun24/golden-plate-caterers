'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/Button'

const EASES = ['standard', 'out-expo', 'in-out-quart', 'spring-soft'] as const
const DURATIONS = ['instant', 'fast', 'base', 'slow', 'slower'] as const

export function MotionDemo() {
  const [on, setOn] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <Button variant="secondary" className="self-start" onClick={() => setOn((v) => !v)}>
        {on ? 'Reset' : 'Play'} curves
      </Button>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="eyebrow text-text-muted">Easing · slower (800ms)</h3>
          {EASES.map((e) => (
            <div key={e} className="flex flex-col gap-1.5">
              <code className="font-mono text-xs text-text-muted">ease-{e}</code>
              <div className="relative h-8 rounded-full bg-bg-subtle">
                <span
                  className="absolute top-1 left-1 size-6 rounded-full border-2 border-accent-fill"
                  style={{
                    transform: on ? 'translateX(calc(min(100cqw, 28rem) - 2rem))' : 'none',
                    transition: `transform var(--duration-slower) var(--ease-${e})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="eyebrow text-text-muted">Durations · ease-out-expo</h3>
          {DURATIONS.map((d) => (
            <div key={d} className="flex items-center gap-4">
              <code className="w-28 font-mono text-xs text-text-muted">{d}</code>
              <span
                className="size-8 rounded-full bg-accent-fill"
                style={{
                  transform: on ? 'scale(1.35)' : 'scale(0.6)',
                  opacity: on ? 1 : 0.4,
                  transition: `transform var(--duration-${d}) var(--ease-out-expo), opacity var(--duration-${d}) var(--ease-standard)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
