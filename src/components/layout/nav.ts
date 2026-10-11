export const PRIMARY_NAV = [
  { href: '/menus', label: 'Menus' },
  { href: '/occasions', label: 'Occasions' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const

export const FOOTER_NAV = {
  Explore: [
    { href: '/menus', label: 'Menus & packages' },
    { href: '/occasions', label: 'Occasions' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/faq', label: 'FAQ' },
  ],
  Company: [
    { href: '/about', label: 'About us' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy policy' },
    { href: '/terms', label: 'Terms' },
  ],
} as const
