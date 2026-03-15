'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Ticket, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { adminAuthService } from '@/services/api';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await adminAuthService.logout();
      // Hard redirect to ensure cookie is cleared before login page loads
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed', error);
      window.location.href = '/admin/login';
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/dashboard/products', icon: Package },
    { name: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingCart },
    { name: 'Coupons', href: '/admin/dashboard/coupons', icon: Ticket },
    { name: 'Banners', href: '/admin/dashboard/banners', icon: ImageIcon },
    { name: 'Review', href: '/admin/dashboard/reviews', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-white flex font-sans text-[#4a4a4a]">
      {/* ─── Sidebar ────────────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 flex flex-col">

        {/* Logo Area */}
        <div className="pt-10 pb-8 px-8 shrink-0">
          <h1 className="text-[26px] font-serif font-bold text-[#222] tracking-tight leading-none">
            My<span className="text-[#da2966] italic">Bloom</span>
            <span className="text-base ml-1">🌿</span>
          </h1>
          <p className="text-[13px] text-[#da2966] font-bold mt-1 tracking-wide">
            Admin Panel
          </p>
        </div>

        {/* Navigation — takes all available space */}
        <nav className="flex-1 overflow-hidden px-5">
          {/* Main nav items */}
          <div className="space-y-[2px]">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin/dashboard'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#fff0f3] text-[#da2966]'
                      : 'text-[#333] hover:bg-gray-50'
                  }`}
                >
                  <item.icon
                    size={20}
                    strokeWidth={2}
                    className={isActive ? 'text-[#da2966]' : 'text-[#555]'}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Settings section */}
          <div className="mt-8">
            <p className="text-[11px] font-extrabold text-[#da2966] uppercase tracking-[0.15em] px-5 mb-3">
              Settings
            </p>
            <div className="space-y-[2px]">
              <Link
                href="/admin/dashboard/settings"
                className="flex items-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold text-[#333] hover:bg-gray-50 transition-all"
              >
                <Settings size={20} strokeWidth={2} className="text-[#555]" />
                General
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-[15px] font-bold text-[#333] hover:bg-gray-50 transition-all text-left"
              >
                <LogOut size={20} strokeWidth={2} className="text-[#555]" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* User Profile — always pinned at bottom */}
        <div className="shrink-0 px-6 py-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#fde2e7] to-[#ffd1dc] flex items-center justify-center border-2 border-white shadow">
                <User size={20} className="text-[#da2966]" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-[#1a1a1a] leading-tight truncate">
                Madame Loubna
              </span>
              <span className="text-[12px] text-gray-400 font-medium truncate">
                Super admin
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 ml-[280px] min-h-screen bg-[#fefbfb]">
        {children}
      </div>
    </div>
  );
}
