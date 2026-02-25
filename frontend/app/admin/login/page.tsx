'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthService } from '@/services/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminAuthService.login({ email, password });
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? 'Invalid credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf8f1]">
      <div className="w-full max-w-sm bg-white border border-[#e8ddd5] rounded-sm p-8 shadow-sm">
        <h1 className="text-2xl font-serif font-bold text-[#4a403a] mb-1 text-center">
          Bloom Parfums
        </h1>
        <p className="text-xs text-center text-gray-400 mb-8 tracking-widest uppercase">
          Admin Panel
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#4a403a] mb-1 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-[#e8ddd5] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#cda873] transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#4a403a] mb-1 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-[#e8ddd5] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#cda873] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a403a] text-white text-sm font-semibold italic py-2.5 rounded-sm hover:bg-[#3a332d] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
