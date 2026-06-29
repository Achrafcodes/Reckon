export interface SafeUser {
  _id: string
  name: string
  email: string
  settings: {
    baseCurrency: string
    theme: 'light' | 'dark' | 'system'
    locale: string
  }
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fields?: Record<string, string[]> }
