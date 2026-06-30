import { type NextRequest, NextResponse } from 'next/server'

// Exact-match paths that are always public (landing, auth pages)
const PUBLIC_EXACT = new Set(['/', '/login', '/register', '/demo'])
// Prefix-match paths (e.g. /login/... if any sub-routes exist)
const PUBLIC_PREFIXES = ['/login', '/register', '/demo']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAccessToken = request.cookies.has('access_token')
  const hasRefreshToken = request.cookies.has('refresh_token')
  const isAuthenticated = hasAccessToken || hasRefreshToken
  const isPublicPath =
    PUBLIC_EXACT.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p + '/'))

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg|manifest\\.json|robots\\.txt|sitemap\\.xml|opengraph-image).*)'],
}
