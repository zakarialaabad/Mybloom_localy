'use client';

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import {
  DashboardSummary,
  DashboardChartData,
  DashboardCustomer,
  DashboardOrder,
} from '@/services/api';
import { getStatusBadge, getStatusDot } from '@/lib/config/statuses';

/* ═══════════════════════════════════════════════════════════════════════════
 * INLINE SVG ICONS
 * ═══════════════════════════════════════════════════════════════════════════ */

function RevenueIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill="#fff0f3" />
      <rect x="10" y="26" width="5" height="8" rx="1.5" fill="#da2966" opacity="0.4" />
      <rect x="18" y="20" width="5" height="14" rx="1.5" fill="#da2966" opacity="0.65" />
      <rect x="26" y="13" width="5" height="21" rx="1.5" fill="#da2966" />
      <path d="M12 22L21 15L33 10" stroke="#da2966" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="33" cy="10" r="2.2" fill="#da2966" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill="#fff0f3" />
      <rect x="11" y="16" width="22" height="18" rx="2.5" stroke="#da2966" strokeWidth="1.8" fill="none" />
      <path d="M16 16V13a6 6 0 0112 0v3" stroke="#da2966" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="25" r="3" fill="#da2966" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill="#fff0f3" />
      <path d="M22 10l3 9h9.5l-7.7 5.6 2.9 9L22 28.8l-7.7 4.8 2.9-9L9.5 19H19z" fill="#da2966" opacity="0.85" />
    </svg>
  );
}

function UpArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserAvatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-[#fde2e7] flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" fill="#da2966" opacity="0.55" />
        <path d="M2 20c0-4 4-7 9-7s9 3 9 7" stroke="#da2966" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55" />
      </svg>
    </div>
  );
}

function ProductThumb() {
  return (
    <div className="w-10 h-10 rounded-xl bg-[#fff0f3] flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="7" width="16" height="13" rx="2.5" stroke="#da2966" strokeWidth="1.6" fill="none" />
        <path d="M8 7V5.5a3 3 0 016 0V7" stroke="#da2966" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SKELETON LOADER
 * ═══════════════════════════════════════════════════════════════════════════ */

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 space-y-3">
            <Skeleton className="w-11 h-11" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-36" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
          <Skeleton className="h-[200px] w-full" />
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DYNAMIC CHART
 * ═══════════════════════════════════════════════════════════════════════════ */

function SalesChart({ chart }: { chart: DashboardChartData }) {
  const max = Math.max(...chart.values, 1);
  const HEIGHT = 200;
  const WIDTH  = 700;
  const points = chart.values.map((v, i) => ({
    x: (i / (chart.values.length - 1)) * WIDTH,
    y: HEIGHT - (v / max) * (HEIGHT * 0.85) - HEIGHT * 0.05,
  }));

  // Build smooth bezier path
  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const prev = points[i - 1];
      const cpX  = (prev.x + p.x) / 2;
      return `C${cpX},${prev.y} ${cpX},${p.y} ${p.x},${p.y}`;
    })
    .join(' ');

  const last = points[points.length - 1];
  const areaPath = `${linePath} L${last.x},${HEIGHT} L0,${HEIGHT} Z`;

  return (
    <div>
      <div className="w-full" style={{ height: `${HEIGHT}px` }}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#da2966" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#da2966" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke="#da2966" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex justify-between mt-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
        {chart.labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminDashboardPage() {
  const { data, isLoading, error, isError, refetch } = useDashboardMetrics();

  const s = data?.summary;

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#fefbfb]/90 backdrop-blur-md px-8 py-6 flex items-center justify-between border-b border-gray-100">
        <div>
          <h2 className="text-[16px] sm:text-[18px] sm:text-[20px] sm:text-[24px] font-bold text-[#111]">Dashboard Overview</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">Welcome back, here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, products…"
              className="w-full h-11 pl-10 pr-4 rounded-full bg-white border border-gray-200 text-[13px] focus:outline-none focus:border-[#da2966]/30 shadow-sm placeholder:text-gray-400"
            />
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
          </button>
        </div>
      </header>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="flex-1 px-8 py-6 pb-12 space-y-6">

        {/* Error */}
        {isError && error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-5 py-4 rounded-xl flex items-center justify-between gap-4">
            <span>Failed to load dashboard data. {error}</span>
            <button
              onClick={() => refetch()}
              className="shrink-0 px-4 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && <DashboardSkeleton />}

        {/* Live data */}
        {!isLoading && data && (
          <>
            {/* ── STAT CARDS ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Total Revenue */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-5">
                  <RevenueIcon />
                  <span className="flex items-center gap-1 text-[13px] font-bold text-green-500">
                    <UpArrow /> {s!.revenue_trend}%
                  </span>
                </div>
                <p className="text-[13px] font-medium text-gray-400 mb-1">Total Revenue</p>
                <h3 className="text-[26px] font-serif font-extrabold text-[#1a1a1a] leading-tight">
                  {Number(s!.total_revenue).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} Dhs
                </h3>
                <p className="text-[12px] text-gray-400 mt-1">vs. last month</p>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-5">
                  <OrdersIcon />
                  <span className="flex items-center gap-1 text-[13px] font-bold text-green-500">
                    <UpArrow /> {s!.orders_trend}%
                  </span>
                </div>
                <p className="text-[13px] font-medium text-gray-400 mb-1">Total Orders</p>
                <h3 className="text-[26px] font-serif font-extrabold text-[#1a1a1a] leading-tight">
                  {s!.total_orders.toLocaleString()}
                </h3>
                <p className="text-[12px] text-gray-400 mt-1">vs. last month</p>
              </div>

              {/* Top-Selling Product */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-5">
                  <StarIcon />
                  <span className="flex items-center gap-1 text-[13px] font-bold text-green-500">
                    <UpArrow /> Top
                  </span>
                </div>
                <p className="text-[13px] font-medium text-gray-400 mb-1">Total Selling Product</p>
                <h3 className="text-[26px] font-serif font-extrabold text-[#1a1a1a] leading-tight truncate">
                  {s!.top_product.name}
                </h3>
                <p className="text-[12px] text-gray-400 mt-1">{s!.top_product.units_sold} Units sold</p>
              </div>
            </div>

            {/* ── CHART + TOP CUSTOMERS ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Sales Analytics */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1a1a1a]">Sales Analytics</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">Revenue over the last 7 days</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#da2966] shrink-0"></span>
                    <span className="text-[12px] font-medium text-gray-500">Current Week</span>
                  </div>
                </div>
                <SalesChart chart={data.sales_chart} />
              </div>

              {/* Top Customers */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-5">Top Customers</h3>
                <div className="space-y-4 flex-1">
                  {data.top_customers.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <UserAvatar />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#222] truncate">{c.phone}</p>
                        <p className="text-[11px] text-gray-400">{c.orders} Orders</p>
                      </div>
                      <span className="text-[13px] font-bold text-[#da2966] shrink-0">{c.total_spent} Dhs</span>
                    </div>
                  ))}
                  {data.top_customers.length === 0 && (
                    <p className="text-[13px] text-gray-400">No customers yet.</p>
                  )}
                </div>
                <div className="mt-5 text-right">
                  <button className="text-[13px] font-bold text-[#da2966] hover:underline">
                    View all customers
                  </button>
                </div>
              </div>
            </div>

            {/* ── RECENT ORDERS ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5">
                <h3 className="text-[16px] font-bold text-[#1a1a1a]">Recent Orders</h3>
                <button className="text-[13px] font-bold text-[#da2966] hover:underline">
                  See all orders
                </button>
              </div>

              {/* ── DESKTOP TABLE ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-b border-gray-100 bg-white">
                      {['Order ID', 'Product', 'Date', 'Customer', 'Status', 'Amount'].map((col, i) => (
                        <th
                          key={col}
                          className={`px-6 py-3 text-[11px] font-extrabold text-[#da2966] uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recent_orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-[14px] text-gray-400">
                          No orders yet.
                        </td>
                      </tr>
                    ) : (
                      data.recent_orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#fefbfb] transition-colors">
                          <td className="px-6 py-4 text-[13px] font-semibold text-[#333]">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <ProductThumb />
                              <span className="text-[13px] text-[#444] font-medium truncate max-w-[140px]">
                                {order.product}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-[#666]">{order.date}</td>
                          <td className="px-6 py-4 text-[13px] text-[#444] font-medium">{order.customer}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${getStatusBadge(order.status, 'order')}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot(order.status, 'order')}`}></span>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[13px] font-bold text-[#333] text-right">
                            {order.amount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="md:hidden flex flex-col divide-y divide-gray-50 border-t border-gray-100">
                {data.recent_orders.length === 0 ? (
                  <div className="px-6 py-16 text-center text-[14px] text-gray-400">
                    No orders yet.
                  </div>
                ) : (
                  data.recent_orders.map((order) => (
                    <div key={order.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 active:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-[#111]">{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadge(order.status, 'order')}`}>
                          <span className={`w-1 h-1 rounded-full shrink-0 ${getStatusDot(order.status, 'order')}`}></span>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <ProductThumb />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#333] truncate">{order.product}</p>
                          <p className="text-[12px] text-gray-500 mt-0.5 truncate">{order.customer}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
                        <span className="text-[12px] font-medium text-gray-400">{order.date}</span>
                        <span className="text-[14px] font-bold text-[#da2966]">{order.amount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
