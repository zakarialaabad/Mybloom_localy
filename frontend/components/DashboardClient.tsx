'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import { clearAuthToken } from '@/lib/auth';
import type { User } from '@/types';
import Navbar from '@/components/Navbar';

interface Props {
  user: User;
}

export default function DashboardClient({ user }: Props) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      clearAuthToken();
      router.push('/login');
    }
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome banner */}
        <div className="mb-8 rounded-2xl bg-brand-50 p-6 ring-1 ring-brand-100">
          <h1 className="text-2xl font-bold text-brand-700">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Orders" value="—" description="Total orders placed" />
          <StatCard label="Wishlist" value="—" description="Saved fragrances" />
          <StatCard label="Loyalty points" value="0" description="Points earned" />
        </div>

        {/* Sign out */}
        <div className="mt-10 border-t pt-6">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
