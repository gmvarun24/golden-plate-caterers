'use client'

import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { CloseIcon } from './icons'

type OverlayProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens it (rendered via asChild). */
  trigger?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Hide the visual title (it stays available to screen readers). */
  hideTitle?: boolean
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

const overlayClass =
  'fixed inset-0 z-(--z-modal) bg-scrim backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-fade-out'

function CloseButton() {
  return (
    <Dialog.Close
      className="absolute top-3 right-3 grid size-11 place-items-center rounded-full text-text-muted transition-colors hover:bg-accent-soft hover:text-text"
      aria-label="Close"
    >
      <CloseIcon className="size-5" />
    </Dialog.Close>
  )
}

function Header({ title, description, hideTitle }: Pick<OverlayProps, 'title' | 'description' | 'hideTitle'>) {
  return (
    <div className={cn('flex flex-col gap-1.5 pr-10', hideTitle && 'sr-only')}>
      <Dialog.Title className="text-3xl leading-snug">{title}</Dialog.Title>
      {description ? (
        <Dialog.Description className="text-sm text-text-muted">{description}</Dialog.Description>
      ) : null}
    </div>
  )
}

/** Centred dialog. Focus is trapped and returned on close; Esc and the scrim close it. */
export function Modal({ open, onOpenChange, trigger, title, description, hideTitle, children, footer, className }: OverlayProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClass} />
        <Dialog.Content
          data-lenis-prevent
          {...(description ? {} : { 'aria-describedby': undefined })}
          className={cn(
            'fixed top-1/2 left-1/2 z-(--z-modal) flex max-h-[min(90dvh,48rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-5',
            'overflow-y-auto rounded-lg border border-border bg-surface-raised p-6 text-text shadow-overlay sm:p-8',
            'data-[state=open]:animate-fade-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-fade-out',
            className,
          )}
        >
          <Header title={title} description={description} hideTitle={hideTitle} />
          {children}
          {footer && <div className="mt-2 flex flex-wrap justify-end gap-3">{footer}</div>}
          <CloseButton />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

type DrawerProps = OverlayProps & {
  /** `right` = side panel (desktop); `bottom` = sheet (mobile). */
  side?: 'right' | 'bottom'
}

/** Side panel or bottom sheet built on the same accessible dialog. */
export function Drawer({ side = 'right', open, onOpenChange, trigger, title, description, hideTitle, children, footer, className }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className={cn(overlayClass, 'z-(--z-drawer)')} />
        <Dialog.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          className={cn(
            'fixed z-(--z-drawer) flex flex-col bg-surface-raised text-text shadow-overlay',
            side === 'right' &&
              'inset-y-0 right-0 h-dvh w-full max-w-md border-l border-border data-[state=open]:animate-slide-in-right data-[state=closed]:pointer-events-none data-[state=closed]:animate-slide-out-right',
            side === 'bottom' &&
              'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-xl border-t border-border pb-[env(safe-area-inset-bottom)] data-[state=open]:animate-slide-in-bottom data-[state=closed]:pointer-events-none data-[state=closed]:animate-slide-out-bottom',
            className,
          )}
        >
          {side === 'bottom' && (
            <span aria-hidden="true" className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border-strong" />
          )}
          <div data-lenis-prevent className="relative flex flex-1 flex-col gap-5 overflow-y-auto p-6">
            <Header title={title} description={description} hideTitle={hideTitle} />
            {children}
          </div>
          {footer && <div className="flex flex-wrap gap-3 border-t border-border p-4">{footer}</div>}
          <CloseButton />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const ModalClose = Dialog.Close
