'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

import { prefersReducedMotion } from './scroll-engine'

/**
 * "Targeting" cursor (fine pointers only, off under reduced motion).
 *   idle       a glowing gold dot inside four thin corner brackets that trail slightly
 *   controls   the brackets glide out and frame the hovered link/button; the dot fades
 *   cards      a compact frame + a tiny tracked label ("VIEW", "CUSTOMISE", "DRAG")
 *   pressing   the brackets tighten
 *   text input hidden, so the native caret is used
 * One rAF loop, transforms only; it sleeps when everything has settled.
 */
type Mode = 'idle' | 'frame' | 'label' | 'hidden'

const LABELS: Record<string, string> = { view: 'View', customise: 'Customise', drag: 'Drag' }
const TEXT_SELECTOR = 'input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]'
const FRAME_SELECTOR = 'a, button, [role="button"], [role="checkbox"], [role="radio"], [role="tab"], label, summary, [data-cursor="magnetic"]'
const IDLE_SIZE = 22
const LABEL_SIZE = 40
const PAD = 6
const CORNER = 7

type Rect = { x: number; y: number; w: number; h: number }

export function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<Mode>('hidden')
  const [label, setLabel] = useState('')
  const dot = useRef<HTMLDivElement>(null)
  const corners = useRef<(HTMLSpanElement | null)[]>([])
  const tag = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)')
    const update = () => setEnabled(fine.matches && !prefersReducedMotion())
    update()
    fine.addEventListener('change', update)
    return () => fine.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add('gp-cursor')

    const pointer = { x: -100, y: -100 }
    const cur: Rect = { x: -100, y: -100, w: IDLE_SIZE, h: IDLE_SIZE }
    let target: HTMLElement | null = null
    let state: Mode = 'hidden'
    let pressed = false
    let magnet: HTMLElement | null = null
    let raf = 0

    const goal = (): Rect => {
      const squeeze = pressed ? 4 : 0
      if (state === 'frame' && target) {
        const r = target.getBoundingClientRect()
        return { x: r.left - PAD + squeeze, y: r.top - PAD + squeeze, w: r.width + PAD * 2 - squeeze * 2, h: r.height + PAD * 2 - squeeze * 2 }
      }
      const size = (state === 'label' ? LABEL_SIZE : IDLE_SIZE) - squeeze * 2
      return { x: pointer.x - size / 2, y: pointer.y - size / 2, w: size, h: size }
    }

    const loop = () => {
      const g = goal()
      const k = state === 'frame' ? 0.24 : 0.3
      cur.x += (g.x - cur.x) * k
      cur.y += (g.y - cur.y) * k
      cur.w += (g.w - cur.w) * k
      cur.h += (g.h - cur.h) * k
      const pos: [number, number][] = [
        [cur.x, cur.y],
        [cur.x + cur.w - CORNER, cur.y],
        [cur.x, cur.y + cur.h - CORNER],
        [cur.x + cur.w - CORNER, cur.y + cur.h - CORNER],
      ]
      corners.current.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(${pos[i]![0]}px, ${pos[i]![1]}px, 0)`
      })
      if (tag.current) tag.current.style.transform = `translate3d(${cur.x + cur.w + 8}px, ${cur.y + cur.h - 12}px, 0)`
      const settled =
        Math.abs(g.x - cur.x) + Math.abs(g.y - cur.y) + Math.abs(g.w - cur.w) + Math.abs(g.h - cur.h) < 0.2
      // Framed elements can move (scroll, magnet), so keep tracking while framing.
      raf = settled && state !== 'frame' ? 0 : requestAnimationFrame(loop)
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }

    const releaseMagnet = () => {
      if (magnet) magnet.style.transform = ''
      magnet = null
    }

    const set = (next: Mode, el: HTMLElement | null = null, text = '') => {
      if (next !== state || el !== target) {
        state = next
        target = el
        setMode(next)
        if (text) setLabel(text)
      }
      wake()
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      if (magnet) {
        const r = magnet.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        magnet.style.transform = `translate3d(${dx * 0.2}px, ${dy * 0.28}px, 0)`
      }
      if (state === 'hidden') set('idle')
      wake()
    }

    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null
      if (!el) return
      if (el.closest(TEXT_SELECTOR)) {
        releaseMagnet()
        return set('hidden')
      }
      const labelled = el.closest<HTMLElement>('[data-cursor]')
      const kind = labelled?.dataset.cursor
      if (kind && LABELS[kind]) {
        releaseMagnet()
        return set('label', null, LABELS[kind])
      }
      const control = el.closest<HTMLElement>(FRAME_SELECTOR)
      if (control) {
        const r = control.getBoundingClientRect()
        // Only frame control-sized things; large clickable areas keep the idle cursor.
        if (r.width < 420 && r.height < 160) {
          if (control.dataset.cursor === 'magnetic' && magnet !== control) {
            releaseMagnet()
            magnet = control
            control.style.transition = 'transform var(--duration-fast) var(--ease-out-expo)'
          }
          return set('frame', control)
        }
      }
      releaseMagnet()
      set('idle')
    }

    const onDown = () => {
      pressed = true
      wake()
    }
    const onUp = () => {
      pressed = false
      wake()
    }
    const onLeave = () => {
      releaseMagnet()
      set('hidden')
    }
    const onScroll = () => {
      if (state === 'frame' && target && !target.isConnected) set('idle')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    root.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      releaseMagnet()
      root.classList.remove('gp-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('pointerover', onOver)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  const cornerClass = 'absolute top-0 left-0 size-[7px] border-accent will-change-transform'
  const visible = mode !== 'hidden'

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-(--z-cursor) transition-opacity duration-(--duration-fast)',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      {/* Four brackets: top-left, top-right, bottom-left, bottom-right */}
      {(['border-t-[1.5px] border-l-[1.5px] rounded-tl-[3px]', 'border-t-[1.5px] border-r-[1.5px] rounded-tr-[3px]', 'border-b-[1.5px] border-l-[1.5px] rounded-bl-[3px]', 'border-r-[1.5px] border-b-[1.5px] rounded-br-[3px]'] as const).map(
        (edges, i) => (
          <span
            key={i}
            ref={(el) => {
              corners.current[i] = el
            }}
            className={cn(cornerClass, edges)}
          />
        ),
      )}
      {/* Dot with a soft glow; fades while framing a control */}
      <div ref={dot} className="absolute top-0 left-0 will-change-transform">
        <div
          className={cn(
            'size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-fill shadow-glow transition-[opacity,transform] duration-(--duration-base) ease-out-expo',
            mode === 'frame' ? 'scale-50 opacity-0' : 'scale-100 opacity-100',
          )}
        />
      </div>
      {/* Micro label beside the frame */}
      <span
        ref={tag}
        className={cn(
          'absolute top-0 left-0 font-body text-[0.625rem] font-medium tracking-[0.28em] text-accent uppercase will-change-transform',
          'transition-opacity duration-(--duration-fast)',
          mode === 'label' ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
      </span>
    </div>
  )
}
