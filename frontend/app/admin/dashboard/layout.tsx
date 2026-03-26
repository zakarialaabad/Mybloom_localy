'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Ticket, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { adminAuthService } from '@/services/api';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

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

  const isFullScreenPage = pathname.endsWith('/create') || pathname.includes('/edit');

  if (isFullScreenPage) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#4a4a4a]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-[#4a4a4a]">
      {/* ─── Mobile Header (Persistent Top Bar) ─────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between h-16 px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-50 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} className="text-[#333]" />
        </button>
        <h1 className="text-[16px] sm:text-[18px] sm:text-[20px] font-serif font-medium text-[#222] tracking-wide">
          My<span className="text-[#da2966] italic">Bloom</span>
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* ─── Mobile Fullscreen Menu ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden bg-white flex flex-col lg:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between h-16 px-6 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100/80 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <X size={16} strokeWidth={2.5} className="text-[#666]" />
            </button>
            <h1 className="text-[16px] sm:text-[18px] sm:text-[20px] font-serif font-medium text-[#222] tracking-wide absolute left-1/2 -translate-x-1/2">
              My<span className="text-[#da2966] italic">Bloom</span>
            </h1>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto px-8 pt-10">
            <div className="space-y-7">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/admin/dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`block text-[17px] font-serif tracking-[0.03em] uppercase transition-colors ${
                      isActive ? 'text-[#da2966]' : 'text-[#333]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="w-full h-px bg-gray-100 my-10 max-w-[80%]"></div>

            <div className="space-y-7">
              <Link
                href="/admin/dashboard/settings"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-4 text-[15px] font-serif tracking-[0.03em] uppercase text-[#444]"
              >
                <Settings size={20} className="text-[#555]" strokeWidth={1.5} />
                GENERAL
              </Link>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-4 text-[15px] font-serif tracking-[0.03em] uppercase text-[#444] w-full text-left"
              >
                <LogOut size={20} className="text-[#555]" strokeWidth={1.5} />
                LOGOUT
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="shrink-0 px-8 py-10 pb-12 mt-auto">
            <div className="flex items-center gap-4">
              <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-[#fde2e7] to-[#ffd1dc] flex items-center justify-center border border-[#f8c5d1] shrink-0">
                <User size={24} className="text-[#d72864]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-serif font-bold text-[#222]">
                  Madame Loubna
                </span>
                <span className="text-[12px] font-serif text-[#666] mt-0.5 tracking-wide">
                  Last visit October 2026 at 12:30 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Desktop Sidebar ────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex left-0 top-0 bottom-0 w-[280px] bg-white z-40 fixed flex-col border-r border-gray-100">
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-5">
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

        {/* User Profile Desktop */}
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
      <div className="w-full lg:flex-1 lg:ml-[280px] min-h-[calc(100vh-64px)] lg:min-h-screen bg-[#fefbfb] pt-[64px] lg:pt-0">
        {children}
      </div>
    </div>
  );
}
