/* Brand graphics for the Payload admin (login screen + nav). Fixed colours because the admin
 * panel does not load the public design tokens. */
import { CATERERS_PATH, LOGO_VIEWBOX, MARK, MARK_SIZE, WORDMARK_PATH } from './logo-geometry'

const Mark = ({ id }: { id: string }) => (
  <>
    <defs>
      <linearGradient id={id} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#E2C27A" />
        <stop offset=".5" stopColor="#C9A24B" />
        <stop offset="1" stopColor="#9C7A2E" />
      </linearGradient>
    </defs>
    <circle cx={MARK.c} cy={MARK.c} r={MARK.wellR} fill="none" stroke="#C9A24B" strokeWidth={1} opacity={0.45} />
    <path d={MARK.g} fill="none" stroke={`url(#${id})`} strokeWidth={MARK.stroke} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={MARK.highlight.cx} cy={MARK.highlight.cy} r={MARK.highlight.r} fill="#E2C27A" />
  </>
)

export function AdminLogo() {
  return (
    <svg
      viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}
      width={280}
      role="img"
      aria-label="Golden Plate Caterers"
      style={{ color: 'var(--theme-text)', maxWidth: '100%', height: 'auto' }}
    >
      <Mark id="gp-admin-logo" />
      <path d={WORDMARK_PATH} fill="currentColor" />
      <path d={CATERERS_PATH} fill="#C9A24B" />
    </svg>
  )
}

export function AdminIcon() {
  return (
    <svg viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`} width={28} height={28} aria-hidden="true">
      <Mark id="gp-admin-icon" />
    </svg>
  )
}
