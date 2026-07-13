const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'achrafcodes99@gmail.com'

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

/**
 * Whether this account is allowed to use data-bearing features (upload,
 * reports, ...). Admin always passes; everyone else needs an admin-approved
 * subscription. Check this in every API route that reads/writes user data —
 * the (dashboard) layout gate only covers page navigations, not direct API
 * calls, which skip proxy.ts entirely (see its matcher) and skip the layout
 * too if hit directly (e.g. via curl/Postman with a valid session cookie).
 */
export function isApprovedAccount(user: { email: string; subscription?: { status?: string } }): boolean {
  return isAdminEmail(user.email) || user.subscription?.status === 'active'
}
