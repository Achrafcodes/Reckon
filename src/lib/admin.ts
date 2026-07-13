const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'achrafcodes99@gmail.com'

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}
