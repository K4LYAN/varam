import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

// ─── Route Protection Config ─────────────────────────────────
/** Routes that require a logged-in user */
const AUTH_REQUIRED = ['/profile', '/checkout', '/order-success']

/** Routes that require admin role */
const ADMIN_REQUIRED = ['/admin']

/** Routes only for guests (logged-in users get redirected) */
const GUEST_ONLY = ['/login', '/register']

/** Whitelist of allowed internal redirect targets */
const SAFE_REDIRECTS = new Set(['/profile', '/checkout', '/cart', '/shop', '/order-success', '/'])

export async function middleware(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl

  const { supabaseResponse, user } = await updateSession(request)

  // ── Guest-only routes: redirect logged-in users to profile ──
  if (user && GUEST_ONLY.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/profile', origin))
  }

  // ── Auth-required routes: redirect unauthenticated users ────
  if (!user && AUTH_REQUIRED.some(p => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', origin)
    // Only carry forward the redirect if it's a safe internal path
    const safe = SAFE_REDIRECTS.has(pathname) ? pathname : '/profile'
    loginUrl.searchParams.set('redirect', safe)
    return NextResponse.redirect(loginUrl)
  }

  // ── Admin routes: require is_admin metadata ──────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', origin))
    }
    const isAdmin = user.user_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', origin))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
