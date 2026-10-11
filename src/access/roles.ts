import type { Access, FieldAccess, PayloadRequest } from 'payload'

export const ROLES = ['owner', 'staff'] as const
export type Role = (typeof ROLES)[number]

/** Works with the server-side user (`req.user`) and the admin UI's ClientUser. */
type MaybeUser = PayloadRequest['user'] | object | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user && 'role' in user && roles.includes((user as { role: unknown }).role as Role))

/** Any logged-in admin user (owner or staff). */
export const isAdmin: Access = ({ req }) => hasRole(req.user, 'owner', 'staff')

/** Owner only — vendor identities, cost prices, roles, brand settings. */
export const isOwner: Access = ({ req }) => hasRole(req.user, 'owner')

export const isOwnerField: FieldAccess = ({ req }) => hasRole(req.user, 'owner')

/** Owners can manage everyone; staff can only read/update their own user record. */
export const isOwnerOrSelf: Access = ({ req }) => {
  if (hasRole(req.user, 'owner')) return true
  if (req.user) return { id: { equals: req.user.id } }
  return false
}
