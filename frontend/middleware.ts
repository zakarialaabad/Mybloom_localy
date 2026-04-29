import { NextRequest, NextResponse } from 'next/server';

// ─── Admin route protection ───────────────────────────────────────────────────
// Guards /gestion-bloom-secure/dashboard/* routes by checking for the admin_logged_in cookie.
// Cookie presence is a redirect gate only — token validity is enforced by the
// backend on every API call. An expired token will produce a 401, which the
// Axios interceptor in services/api.ts handles by redirecting to /gestion-bloom-secure/authentification.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/gestion-bloom-secure/dashboard');
  const isLoginRoute = pathname === '/gestion-bloom-secure/authentification';

  // If already on login page, never redirect (stop the loop)
  if (isLoginRoute) {
    return NextResponse.next();
  }

  if (isAdminRoute) {
    const loggedIn = request.cookies.get('admin_logged_in')?.value;

    if (!loggedIn) {
      const loginUrl = new URL('/gestion-bloom-secure/authentification', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/gestion-bloom-secure/:path*'],
};
