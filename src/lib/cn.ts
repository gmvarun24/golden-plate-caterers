import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge must know our custom font-size names, otherwise it treats `text-display`
 * (a size) and `text-text` (a colour) as the same group and drops one of them.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'display'],
      color: [
        'bg',
        'bg-subtle',
        'surface',
        'surface-raised',
        'surface-sunken',
        'scrim',
        'text',
        'text-muted',
        'text-inverse',
        'accent',
        'accent-hover',
        'accent-display',
        'accent-fill',
        'accent-fill-hover',
        'accent-soft',
        'on-accent',
        'secondary',
        'secondary-fill',
        'on-secondary',
        'border',
        'border-strong',
        'border-input',
        'border-accent',
        'focus-ring',
        'success',
        'warning',
        'danger',
        'on-danger',
        'diet-veg',
        'diet-nonveg',
        'diet-jain',
      ],
      shadow: ['sm', 'md', 'lg', 'overlay', 'glow'],
      radius: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
      ease: ['standard', 'out-expo', 'in-out-quart', 'spring-soft'],
      tracking: ['display', 'tight', 'normal', 'wide', 'caps'],
      leading: ['tight', 'snug', 'normal', 'relaxed'],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
