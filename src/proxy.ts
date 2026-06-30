import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_EXACT = new Set(['/', '/login', '/register', '/demo'])
const PUBLIC_PREFIXES = ['/login', '/register', '/demo']
const SUBSCRIBE_EXACT = new Set(['/subscribe'])
const SUBSCRIBE_PREFIXES = ['/subscribe']

const AUTH_COOKIES = ['access_token', 'refresh_token']

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

interface TokenPayload {
  subscriptionStatus?: 'pending' | 'active' | 'cancelled'
}

/** Returns payload if token is cryptographically valid, null otherwise. */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as TokenPayload
  } catch {
    return null
  }
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

  const isSubscribePath =
    SUBSCRIBE_EXACT.has(pathname) ||
    SUBSCRIBE_PREFIXES.some((p) => pathname.startsWith(p + '/'))

  const accessToken = request.cookies.get('access_token')?.value

  // Verify the access token — don't just check presence
  const payload = accessToken ? await verifyToken(accessToken) : null
  const isAuthenticated = payload !== null

  // Not logged in → clear stale cookies and send to login
  if (!isAuthenticated && !isPublicPath) {
    return redirectToLogin(request, pathname)
  }

  // Logged-in users hitting auth pages → send to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check subscription for protected routes
  if (isAuthenticated && !isPublicPath && !isSubscribePath) {
    const status = payload?.subscriptionStatus ?? 'pending'
    if (status !== 'active') {
      return NextResponse.redirect(new URL('/subscribe', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg|manifest\\.json|robots\\.txt|sitemap\\.xml|opengraph-image).*)'],
}
