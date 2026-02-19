'use client';

import Link from 'next/link';
import type { User } from '@/types';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/dashboard" className="text-xl font-extrabold text-brand-600 tracking-tight">
          Parfum
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 sm:block">
            {user.name}
          </span>
          <button
            onClick={onLogout}
            className="btn-secondary !py-1.5 !px-3 text-xs"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
