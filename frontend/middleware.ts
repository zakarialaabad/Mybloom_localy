import { NextRequest, NextResponse } from 'next/server';

// ─── Admin route protection ───────────────────────────────────────────────────
// Guards /admin/* routes by checking for the presence of the admin_token cookie.
// Cookie presence is a redirect gate only — token validity is enforced by the
// backend on every API call. An expired token will produce a 401, which the
// Axios interceptor in services/api.ts handles by redirecting to /admin/login.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';

  if (isAdminRoute && !isLoginRoute) {
    const hasAdminCookie = request.cookies.has('admin_token');

    if (!hasAdminCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
