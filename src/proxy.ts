import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_EXACT = new Set(['/', '/login', '/register', '/demo'])
const PUBLIC_PREFIXES = ['/login', '/register', '/demo']
// Routes accessible while logged-in but unsubscribed
const SUBSCRIBE_EXACT = new Set(['/subscribe'])
const SUBSCRIBE_PREFIXES = ['/subscribe']

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? '')
}

async function getSubscriptionStatus(token: string): Promise<'pending' | 'active' | 'cancelled' | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return (payload.subscriptionStatus as 'pending' | 'active' | 'cancelled') ?? 'pending'
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const hasRefreshToken = request.cookies.has('refresh_token')
  const isAuthenticated = !!accessToken || hasRefreshToken

  const isPublicPath =
    PUBLIC_EXACT.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p + '/'))

  const isSubscribePath =
    SUBSCRIBE_EXACT.has(pathname) ||
    SUBSCRIBE_PREFIXES.some((p) => pathname.startsWith(p + '/'))

  // Not logged in → send to login (unless public)
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Logged-in users hitting public auth pages → send to dashboard or subscribe
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check subscription for protected routes (not public, not /subscribe itself)
  if (isAuthenticated && !isPublicPath && !isSubscribePath) {
    const status = accessToken ? await getSubscriptionStatus(accessToken) : 'pending'
    if (status !== 'active') {
      return NextResponse.redirect(new URL('/subscribe', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg|manifest\\.json|robots\\.txt|sitemap\\.xml|opengraph-image).*)'],
}
