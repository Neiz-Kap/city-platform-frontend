import { type NextRequest, NextResponse } from "next/server"

/**
 * Route protection patterns
 */
const PUBLIC_ROUTES = ["/", "/dashboard/login", "/dashboard/register"]

const PROTECTED_ROUTE_PATTERNS = [
  "/dashboard/complaint",
  "/dashboard/nlp",
  "/dashboard/source",
  "/dashboard/labels",
  "/dashboard/report",
]

/**
 * Check if route is a guest/public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

/**
 * Check if route is protected (requires authentication)
 */
function isProtectedRoute(pathname: string): boolean {
  // Dashboard root is protected
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return true
  }

  // Check against protected patterns
  return PROTECTED_ROUTE_PATTERNS.some((pattern) =>
    pathname.startsWith(pattern),
  )
}

/**
 * Check if user is authenticated via cookie
 * Note: For Bearer tokens in localStorage, we use a sync cookie
 * The client sets this cookie when token is available
 */
function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("accessToken")?.value
  return !!token && token.length > 0
}

/**
 * Next.js Middleware
 *
 * Handles route protection for Bearer token authentication.
 * Note: localStorage is not accessible in middleware, so we use a
 * sync cookie pattern where the client sets a cookie with the token presence.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API routes and static files
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next()
  }

  const authenticated = isAuthenticated(request)

  // Redirect authenticated users away from public routes
  if (authenticated && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users from protected routes to login
  if (!authenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/dashboard/login", request.url)
    // Add return URL for post-login redirect
    loginUrl.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

/**
 * Middleware config
 * Match all paths except static files and API
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
