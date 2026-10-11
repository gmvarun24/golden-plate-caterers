import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

import { Spinner } from './Spinner'

export const buttonVariants = cva(
  [
    'relative isolate inline-flex shrink-0 select-none items-center justify-center gap-2 overflow-hidden',
    'rounded-full font-medium tracking-wide whitespace-nowrap',
    'transition-[background-color,color,border-color,box-shadow,transform] duration-(--duration-base) ease-standard',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    '[&_svg]:size-[1.15em] [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        /** Gold fill. On hover a slow sheen sweeps across (the plate catching light). */
        primary: [
          'bg-accent-fill text-on-accent shadow-sm hover:bg-accent-fill-hover hover:shadow-glow',
          'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[image:var(--gradient-sheen)]',
          'before:-translate-x-full before:transition-transform before:duration-(--duration-slower) before:ease-out-expo',
          'hover:before:translate-x-full',
        ],
        /** Quiet outline for secondary actions. */
        secondary:
          'border border-border-input bg-transparent text-text hover:border-accent hover:text-accent',
        /** Banana-leaf fill — e.g. WhatsApp / confirm actions. */
        leaf: 'bg-secondary-fill text-on-secondary shadow-sm hover:opacity-90',
        ghost: 'bg-transparent text-text hover:bg-accent-soft hover:text-accent',
        link: 'h-auto rounded-none px-0 text-accent underline decoration-1 underline-offset-4 hover:decoration-2',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'size-11 p-0',
        'icon-sm': 'size-9 p-0',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. a Next <Link>) with button styles. */
    asChild?: boolean
    loading?: boolean
    /** Custom cursor state (Phase 5): "magnetic", "view", "customise" … */
    cursor?: string
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  cursor,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      data-cursor={cursor ?? (variant === 'primary' || variant === undefined ? 'magnetic' : undefined)}
      {...(asChild ? {} : { type: type ?? 'button', disabled: disabled || loading })}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Spinner label="Please wait" />}
          {children}
        </>
      )}
    </Comp>
  )
}
