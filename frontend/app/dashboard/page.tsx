import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/auth';
import DashboardClient from '@/components/DashboardClient';
import type { User } from '@/types';

/**
 * Dashboard — Server Component with SSR.
 * Reads the auth token from the HttpOnly cookie and pre-fetches the
 * authenticated user so the page is rendered with real data on the server.
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.NEXT_PUBLIC_TOKEN_COOKIE ?? 'parfum_token');

  // If no token, redirect to login
  if (!token?.value) {
    redirect('/login');
  }

  let user: User;
  try {
    user = await serverFetch<User>('/auth/me', token.value);
  } catch {
    redirect('/login');
  }

  return <DashboardClient user={user} />;
}
