import NextLink from 'next/link'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

import { ArrowUpRightIcon } from './icons'

type LinkProps = ComponentProps<typeof NextLink> & {
  /**
   * `inline` (default): underlined, for links inside body text (never colour-only).
   * `nav`: underline draws in on hover/focus, for menus and footers.
   */
  variant?: 'inline' | 'nav'
}

const isExternal = (href: LinkProps['href']) =>
  typeof href === 'string' && /^(https?:)?\/\//.test(href)

export function Link({ variant = 'inline', className, href, children, ...props }: LinkProps) {
  const external = isExternal(href)
  return (
    <NextLink
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'inline-flex items-baseline gap-1 rounded-xs transition-colors duration-(--duration-fast) ease-standard',
        variant === 'inline' &&
          'text-accent underline decoration-current/40 decoration-1 underline-offset-[0.2em] hover:text-accent-hover hover:decoration-current',
        variant === 'nav' && [
          'text-text bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-0.5',
          'transition-[background-size,color] duration-(--duration-base) ease-out-expo',
          'hover:bg-[length:100%_1px] hover:text-accent focus-visible:bg-[length:100%_1px]',
        ],
        className,
      )}
      {...props}
    >
      {children}
      {external && (
        <>
          <ArrowUpRightIcon className="size-[0.85em] self-center" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </NextLink>
  )
}
