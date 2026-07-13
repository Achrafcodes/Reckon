import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const PUBLIC_EXACT = new Set(['/', '/login', '/register', '/demo', '/privacy', '/terms'])
const PUBLIC_PREFIXES = ['/login', '/register', '/demo', '/privacy', '/terms']

const AUTH_COOKIES = ['access_token', 'refresh_token']

function getAccessSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

interface TokenPayload {
  userId?: string
  email?: string
  subscriptionStatus?: 'pending' | 'active' | 'cancelled'
}

async function verifyAccess(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret())
    return payload as TokenPayload
  } catch {
    return null
  }
}

async function verifyRefresh(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret())
    return payload as TokenPayload
  } catch {
    return null
  }
}

/** Mint a fresh 15-min access token from a valid refresh payload. */
async function mintAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getAccessSecret())
}

/** Redirect to login and clear any stale auth cookies to break redirect loops. */
function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL('/login', request.url)
  if (pathname.startsWith('/') && !pathname.startsWith('//')) {
    loginUrl.searchParams.set('callbackUrl', pathname)
  }
  const res = NextResponse.redirect(loginUrl)
  for (const name of AUTH_COOKIES) {
    res.cookies.delete(name)
  }
  return res
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath =
    PUBLIC_EXACT.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p + '/'))

  const accessToken  = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // 1. Try access token first (fast path — no DB, pure crypto)
  let payload = accessToken ? await verifyAccess(accessToken) : null
  let freshAccessToken: string | null = null

  // 2. Access token missing or expired — silently refresh via refresh token
  if (!payload && refreshToken) {
    const refreshPayload = await verifyRefresh(refreshToken)
    if (refreshPayload) {
      payload = refreshPayload
      // Mint a new access token so the next request is fast again
      freshAccessToken = await mintAccessToken(refreshPayload)
    }
  }

  const isAuthenticated = payload !== null

  // Not authenticated → clear cookies and send to login
  if (!isAuthenticated && !isPublicPath) {
    return redirectToLogin(request, pathname)
  }

  // Authenticated users hitting auth pages → send to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // No access-approval gate here on purpose: the access token's
  // subscriptionStatus claim goes stale between admin approvals and the
  // user's next login (tokens aren't re-signed on approval), and gating
  // here — before any DB read — would either block a just-approved user or
  // create a redirect loop with /access-pending. The real, DB-backed check
  // lives in the (dashboard) layout and on /access-pending itself. See
  // docs/archive/payment-integration.md for why this isn't a payment gate.

  const res = NextResponse.next()

  // Attach fresh access token if we just refreshed — keeps the user logged in
  if (freshAccessToken) {
    const isProduction = process.env.NODE_ENV === 'production'
    res.cookies.set('access_token', freshAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 15, // 15 min
    })
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg|manifest\\.json|robots\\.txt|sitemap\\.xml|opengraph-image).*)'],
}
