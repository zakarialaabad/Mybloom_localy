'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/api';
import { setAuthToken } from '@/lib/auth';
import type { ApiValidationError } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: [] }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const { token } = await authService.register(form);
      setAuthToken(token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const apiError = err as ApiValidationError;
      if (apiError?.errors) {
        setFieldErrors(apiError.errors);
      }
      setError(apiError?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { id: 'name',                  label: 'Full name',        type: 'text',     autocomplete: 'name',         placeholder: 'Jane Doe' },
    { id: 'email',                 label: 'Email address',    type: 'email',    autocomplete: 'email',        placeholder: 'you@example.com' },
    { id: 'password',              label: 'Password',         type: 'password', autocomplete: 'new-password', placeholder: '••••••••' },
    { id: 'password_confirmation', label: 'Confirm password', type: 'password', autocomplete: 'new-password', placeholder: '••••••••' },
  ] as const;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {fields.map(({ id, label, type, autocomplete, placeholder }) => (
            <div key={id} className="space-y-1.5">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                id={id}
                name={id}
                type={type}
                autoComplete={autocomplete}
                required
                value={form[id]}
                onChange={handleChange}
                className="form-input"
                placeholder={placeholder}
              />
              {fieldErrors[id]?.map((msg) => (
                <p key={msg} className="text-xs text-red-600">{msg}</p>
              ))}
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  );
}
