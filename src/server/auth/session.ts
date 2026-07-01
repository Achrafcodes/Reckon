import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { env } from '@/lib/env'
import { connectDB } from '@/server/db/connect'
import { User, type IUser } from '@/server/db/models'

const ACCESS_SECRET = new TextEncoder().encode(env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET)

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'

export interface SessionPayload {
  userId: string
  email: string
  subscriptionStatus?: 'pending' | 'active' | 'cancelled'
  baseCurrency?: string
  name?: string
}

// ── Token creation ──────────────────────────────────────────────────────────

export async function signAccessToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(ACCESS_SECRET)
}

export async function signRefreshToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(REFRESH_SECRET)
}

// ── Token verification ──────────────────────────────────────────────────────

export async function verifyAccessToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      subscriptionStatus: payload.subscriptionStatus as SessionPayload['subscriptionStatus'],
      baseCurrency: payload.baseCurrency as string | undefined,
      name: payload.name as string | undefined,
    }
  } catch {
    return null
  }
}

async function verifyRefreshToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      subscriptionStatus: payload.subscriptionStatus as SessionPayload['subscriptionStatus'],
    }
  } catch {
    return null
  }
}

// ── Cookie helpers ──────────────────────────────────────────────────────────

const isProduction = env.NODE_ENV === 'production'

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15, // 15 min
  })

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_COOKIE)
  cookieStore.delete(REFRESH_COOKIE)
}

// ── getCurrentUser ──────────────────────────────────────────────────────────
// Always call this in Server Components / Actions / Route Handlers that read
// protected data. Never rely solely on proxy.ts for auth.

/**
 * Fast, DB-free session read — verifies the JWT and returns the payload.
 * Use this in pages that only need userId/email (avoids a DB round-trip).
 * Falls back to refresh token so it works even after access token expires.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken)
    if (payload) return payload
  }
  // Try refresh token (same logic as middleware)
  const refreshToken = cookieStore.get('refresh_token')?.value
  if (!refreshToken) return null
  try {
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      subscriptionStatus: payload.subscriptionStatus as SessionPayload['subscriptionStatus'],
      baseCurrency: payload.baseCurrency as string | undefined,
      name: payload.name as string | undefined,
    }
  } catch {
    return null
  }
})

// cache() deduplicates calls within a single request — multiple Server Components
// calling getCurrentUser() on the same page share one DB query, not N queries.
export const getCurrentUser = cache(async (): Promise<IUser | null> => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken)
    if (payload) {
      await connectDB()
      return User.findById(payload.userId).lean().exec() as Promise<IUser | null>
    }
  }

  // Access token missing or expired — try refresh token
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value
  if (!refreshToken) return null

  const payload = await verifyRefreshToken(refreshToken)
  if (!payload) return null

  await connectDB()
  const user = await User.findById(payload.userId).select('+refreshTokenHash').lean().exec() as (IUser & { refreshTokenHash?: string }) | null
  if (!user) return null

  // Return user without sensitive fields.
  // Silent token refresh is intentionally skipped here — cookies() writes are
  // forbidden in Server Components (Next 16). The short-lived access token will
  // be re-issued on the next Server Action / Route Handler call.
  const { refreshTokenHash: _rth, ...safeUser } = user
  return safeUser as unknown as IUser
})
