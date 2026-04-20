'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
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

function CustomerAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return (
    <div className="w-11 h-11 rounded-full bg-[#fde2e7] flex items-center justify-center shrink-0">
      <span className="text-[13px] font-bold text-[#da2966] tracking-wide">{initials}</span>
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
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const dismissTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const max    = Math.max(...chart.values, 1);
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

  const last     = points[points.length - 1];
  const areaPath = `${linePath} L${last.x},${HEIGHT} L0,${HEIGHT} Z`;

  // ── Shared: clientX → nearest data point index ──────────────────────────
  const resolveIdx = (clientX: number): number | null => {
    const el = wrapperRef.current;
    if (!el) return null;
    const { left, width } = el.getBoundingClientRect();
    const xPct = (clientX - left) / width;
    return Math.max(0, Math.min(chart.values.length - 1, Math.round(xPct * (chart.values.length - 1))));
  };

  // ── Mouse (desktop) ──────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const idx = resolveIdx(e.clientX);
    if (idx !== null) setActiveIdx(idx);
  };

  // ── Touch (mobile) ───────────────────────────────────────────────────────
  const clearDismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    clearDismiss();
    const idx = resolveIdx(e.touches[0]?.clientX ?? 0);
    if (idx !== null) setActiveIdx(idx);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    clearDismiss();
    const idx = resolveIdx(e.touches[0]?.clientX ?? 0);
    if (idx !== null) setActiveIdx(idx);
  };

  // Keep tooltip visible for 1.5 s after finger lifts so user can read it
  const handleTouchEnd = () => {
    dismissTimer.current = setTimeout(() => setActiveIdx(null), 1500);
  };

  const ap       = activeIdx !== null ? points[activeIdx] : null;
  const xPct     = ap ? (ap.x / WIDTH) * 100 : 0;
  const flipLeft = xPct > 65;

  return (
    <div>
      <div
        ref={wrapperRef}
        className="relative w-full select-none"
        style={{ height: `${HEIGHT}px`, cursor: 'crosshair', touchAction: 'pan-y' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActiveIdx(null)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#da2966" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#da2966" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="#da2966" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Vertical guide + active dot */}
          {ap && activeIdx !== null && (
            <>
              <line
                x1={ap.x} y1={0} x2={ap.x} y2={HEIGHT}
                stroke="#da2966" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.35"
              />
              <circle cx={ap.x} cy={ap.y} r="7"   fill="white"   />
              <circle cx={ap.x} cy={ap.y} r="4.5" fill="#da2966" />
              <circle cx={ap.x} cy={ap.y} r="7"   fill="none" stroke="#da2966" strokeWidth="2" />
            </>
          )}
        </svg>

        {/* ── Tooltip card ── */}
        {ap && activeIdx !== null && (
          <div
            className="absolute top-1 z-20 pointer-events-none"
            style={{
              left:      `${xPct}%`,
              transform: flipLeft
                ? 'translate(-106%, 0)'
                : xPct < 12
                  ? 'translate(4px, 0)'
                  : 'translate(-50%, 0)',
            }}
          >
            <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 px-4 py-3 w-[136px]">
              {/* Day label */}
              <p className="text-[11px] font-extrabold text-[#da2966] uppercase tracking-widest mb-2">
                {chart.labels[activeIdx]}
              </p>
              {/* Revenue */}
              <p className="text-[15px] font-bold text-[#1a1a1a] leading-tight">
                {chart.values[activeIdx].toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
                <span className="text-[11px] font-semibold text-gray-400 ml-1">Dhs</span>
              </p>
              {/* Orders count */}
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="4" width="10" height="7.5" rx="1.2" stroke="#da2966" strokeWidth="1.2" fill="none" />
                  <path d="M4 4V3a2 2 0 014 0v1" stroke="#da2966" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </svg>
                <p className="text-[11px] text-gray-500 font-semibold">
                  {(chart.orders?.[activeIdx] ?? 0)} order{(chart.orders?.[activeIdx] ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Day labels */}
      <div className="flex justify-between mt-2 text-[11px] font-semibold uppercase tracking-wider">
        {chart.labels.map((l, i) => (
          <span
            key={l}
            className={`transition-colors duration-150 ${
              activeIdx === i ? 'text-[#da2966] font-extrabold' : 'text-gray-400'
            }`}
          >
            {l}
          </span>
        ))}
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
      <header className="sticky top-[64px] lg:top-0 z-30 bg-[#fefbfb]/90 backdrop-blur-md px-4 sm:px-8 py-3 sm:py-5 flex items-center justify-between border-b border-gray-100 gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] sm:text-[20px] lg:text-[24px] font-bold text-[#111] leading-tight">Aperçu du tableau de bord</h2>
          <p className="text-[12px] sm:text-[13px] text-gray-400 mt-0.5 hidden sm:block">Bienvenue, voici ce qui se passe aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 flex-1 justify-end">
          <div className="relative w-full max-w-[160px] sm:max-w-[220px] lg:max-w-[288px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher…"
              className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-3 sm:pr-4 rounded-full bg-white border border-gray-200 text-[12px] sm:text-[13px] focus:outline-none focus:border-[#da2966]/30 shadow-sm placeholder:text-gray-400"
            />
          </div>
        </div>
      </header>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-8 py-4 sm:py-6 pb-12 space-y-4 sm:space-y-6">

        {/* Error */}
        {isError && error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-5 py-4 rounded-xl flex items-center justify-between gap-4">
            <span>Échec du chargement des données du tableau de bord. {error}</span>
            <button
              onClick={() => refetch()}
              className="shrink-0 px-4 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 transition-colors"
            >
              Réessayer
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
                <p className="text-[13px] font-medium text-gray-400 mb-1">Chiffre d'affaires total</p>
                <h3 className="text-[26px] font-serif font-extrabold text-[#1a1a1a] leading-tight">
                  {Number(s!.total_revenue).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} Dhs
                </h3>
                <p className="text-[12px] text-gray-400 mt-1">vs mois dernier</p>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-5">
                  <OrdersIcon />
                  <span className="flex items-center gap-1 text-[13px] font-bold text-green-500">
                    <UpArrow /> {s!.orders_trend}%
                  </span>
                </div>
                <p className="text-[13px] font-medium text-gray-400 mb-1">Commandes totales</p>
                <h3 className="text-[26px] font-serif font-extrabold text-[#1a1a1a] leading-tight">
                  {s!.total_orders.toLocaleString()}
                </h3>
                <p className="text-[12px] text-gray-400 mt-1">vs mois dernier</p>
              </div>

              {/* Top-Selling Product */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-5">
                  <StarIcon />
                  <span className="flex items-center gap-1 text-[13px] font-bold text-green-500">
                    <UpArrow /> Top
                  </span>
                </div>
                <p className="text-[13px] font-medium text-gray-400 mb-1">Produit le plus vendu</p>
                <h3 className="text-[26px] font-serif font-extrabold text-[#1a1a1a] leading-tight truncate">
                  {s!.top_product.name}
                </h3>
                <p className="text-[12px] text-gray-400 mt-1">{s!.top_product.units_sold} unités vendues</p>
              </div>
            </div>

            {/* ── CHART + TOP CUSTOMERS ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Sales Analytics */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1a1a1a]">Analyse des ventes</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">Chiffre d'affaires des 7 derniers jours</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#da2966] shrink-0"></span>
                    <span className="text-[12px] font-medium text-gray-500">Semaine en cours</span>
                  </div>
                </div>
                <SalesChart chart={data.sales_chart} />
              </div>

              {/* Top Customers */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-4">Meilleurs clients</h3>
                <div className="flex-1 divide-y divide-gray-100">
                  {data.top_customers.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 py-3.5">
                      <CustomerAvatar name={c.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#1a1a1a] truncate">{c.name}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate">{c.phone}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-bold italic text-[#da2966]">{Number(c.total_spent).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} Dhs</p>
                        <p className="text-[12px] italic text-gray-400 mt-0.5">{c.orders} Commandes</p>
                      </div>
                    </div>
                  ))}
                  {data.top_customers.length === 0 && (
                    <p className="text-[13px] text-gray-400 py-4">Aucun client pour l'instant.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── RECENT ORDERS ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5">
                <h3 className="text-[16px] font-bold text-[#1a1a1a]">Commandes récentes</h3>
                <Link href="/admin/dashboard/orders" className="text-[13px] font-bold text-[#da2966] hover:underline">
                  Voir toutes les commandes
                </Link>
              </div>

              {/* ── DESKTOP TABLE ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-b border-gray-100 bg-white">
                      {['N° de commande', 'Articles', 'Date', 'Client', 'Statut', 'Montant'].map((col, i) => (
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
                          Aucune commande pour l'instant.
                        </td>
                      </tr>
                    ) : (
                      data.recent_orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#fefbfb] transition-colors">
                          <td className="px-6 py-4 text-[13px] font-semibold text-[#333]">
                            {order.order_number}
                          </td>
                          <td className="px-6 py-4 text-[13px] text-[#666]">
                            {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
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
                    Aucune commande pour l'instant.
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
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#333]">{order.items_count} {order.items_count === 1 ? 'item' : 'items'}</p>
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
