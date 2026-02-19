import Cookies from 'js-cookie';

const TOKEN_COOKIE = process.env.NEXT_PUBLIC_TOKEN_COOKIE ?? 'parfum_token';
const API_URL      = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── Client-side helpers ──────────────────────────────────────────────────────

/**
 * Persist a JWT to a secure, sameSite cookie.
 * NOTE: On the client, we cannot set HttpOnly; that is done by the server response.
 * This stores the token for client-side Authorization header attachment.
 */
export function setAuthToken(token: string): void {
  Cookies.set(TOKEN_COOKIE, token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 1, // 1 day — matches Laravel JWT TTL
  });
}

export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function clearAuthToken(): void {
  Cookies.remove(TOKEN_COOKIE);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

// ─── Server-side helper (RSC / Route Handlers only) ──────────────────────────

/**
 * Fetches a resource from the API with server-side authentication.
 * Use this in Next.js Server Components; it never runs in the browser.
 *
 * @param path  - API path relative to NEXT_PUBLIC_API_URL, e.g. '/auth/me'
 * @param token - JWT from the incoming request cookie
 */
export async function serverFetch<T>(path: string, token: string): Promise<T> {
  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    // Force no caching for authenticated requests
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json() as { data?: T };
  // Support both `{ data: T }` wrapped and raw `T` shapes
  return (json.data ?? json) as T;
}
