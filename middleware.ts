/**
 * middleware.ts
 *
 * Protects all routes under /(app) and /(admin).
 * Unauthenticated requests are redirected to /login.
 * Admin routes additionally check role (done in layout + API handlers).
 *
 * NextAuth v4 middleware via withAuth.
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    // Block non-admins from /admin routes
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true if there is a valid JWT token (user is authenticated)
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  // Protect these path patterns — auth pages and API routes are NOT matched
  matcher: [
    '/dashboard/:path*',
    '/exam/:path*',
    '/review/:path*',
    '/history/:path*',
    '/admin/:path*',
  ],
}
