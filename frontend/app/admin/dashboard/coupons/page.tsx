'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  adminCouponService,
  AdminCoupon,
  AdminCouponStats,
} from '@/services/api';
import { useCouponList } from '@/hooks/useCouponList';
import CouponTable from '@/components/CouponTable';
import {
  Search,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Ticket,
  Package,
  Clock,
  TrendingUp,
  X,
  Edit3,
  Check,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
};

const isExpiredDate = (iso: string | null) =>
  iso ? new Date(iso) < new Date() : false;

/**
 * Determine coupon status based on coupon properties
 */
function getCouponStatus(coupon: AdminCoupon): 'active' | 'expired' | 'exhausted' | 'archived' {
  if (coupon.is_expired) return 'expired';
  if (!coupon.is_active) return 'archived';
  if (coupon.is_exhausted) return 'exhausted';
  return 'active';
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  // ── Filter / search state ─────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ── Delete confirmation state ──────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Stats state ────────────────────────────────────────────────────────────
  const [stats, setStats]         = useState<AdminCouponStats | null>(null);

  // ── Fetch coupons with React Query ─────────────────────────────────────────
  const { coupons, meta, isLoading, refetch } = useCouponList({
    page: currentPage,
    limit: 20,
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(search.trim() && { search: search.trim() }),
  });

  const totalPages = meta?.last_page ?? 1;
  const totalCount = meta?.total ?? 0;
  const perPage = meta?.per_page ?? 20;

  // ── Fetch stats ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminCouponService.stats();
        setStats(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const pageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const paginationFrom = totalCount === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const paginationTo   = Math.min(currentPage * perPage, totalCount);

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (deletingId === null) return;
    setIsDeleting(true);
    try {
      await adminCouponService.destroy(deletingId);
      setDeletingId(null);
      refetch();
      // Refresh stats
      const res = await adminCouponService.stats();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const toggleActive = async (coupon: AdminCoupon) => {
    try {
      await adminCouponService.update(coupon.id, { is_active: !coupon.is_active });
      refetch();
      // Refresh stats
      const res = await adminCouponService.stats();
      setStats(res);
    } catch (e) {
      console.error(e);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 sm:p-8 max-w-[1200px] mx-auto w-full">

      {/* ── Loading overlay ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-4 sm:p-6 w-[360px] mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#111]">Delete Coupon</h3>
              <button onClick={() => setDeletingId(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-[14px] text-gray-500 mb-6">This coupon will be permanently deleted. Orders using it will keep their discount.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-[8px] border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 rounded-[8px] bg-red-500 text-white text-[14px] font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors">{isDeleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-tight mb-2">Promo Codes</h1>
          <p className="text-[14px] text-gray-500">Manage and track your premium campaign discounts across all collections.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            href="/admin/dashboard/coupons/create"
            className="flex items-center gap-2 bg-[#423835] text-white px-5 py-3 rounded-[8px] text-[13px] font-bold shadow-sm hover:bg-[#2d2624] transition-colors"
          >
            <Plus size={16} strokeWidth={3} />
            Create New Code
          </Link>
        </div>
      </div>

      {/* ─── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:p-6 mb-8">

        {/* Active Coupons */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <Ticket size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-2.5 py-1 rounded-[6px] text-[13px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              Live
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Active Coupons</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.active.toLocaleString() : <div className='h-9 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <div className="text-[12px] text-gray-400 mt-2">
            {stats ? `${stats.total.toLocaleString()} total` : <div className='h-3 w-20 bg-gray-200 rounded animate-pulse inline-block' />}
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <Package size={24} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Total Redemptions</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.total_redemptions.toLocaleString() : <div className='h-9 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <div className="text-[12px] text-gray-400 mt-2">Across all coupons</div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966]">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            {stats && stats.expiring_soon > 0 && (
              <div className="flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-[6px] text-[13px] font-bold">
                Needs attention
              </div>
            )}
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Expiring Soon</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.expiring_soon.toLocaleString() : <div className='h-9 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <div className="text-[12px] text-gray-400 mt-2">Within next 7 days</div>
        </div>

      </div>

      {/* ─── Codes Table ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] border border-[#f2e6ea] shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-[8px] text-[13px] focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966]"
              />
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-[8px] p-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {(['all', 'active', 'inactive', 'expired'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold capitalize transition-colors whitespace-nowrap ${
                    statusFilter === s ? 'bg-white text-[#da2966] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[13px] text-gray-500 font-medium whitespace-nowrap self-end sm:self-auto mt-1 sm:mt-0">
            {totalCount === 0 ? 'No coupons' : `Showing ${paginationFrom}–${paginationTo} of ${totalCount.toLocaleString()}`}
          </div>
        </div>

        {/* Table */}
        <CouponTable
          coupons={coupons}
          isLoading={isLoading}
          onToggleActive={toggleActive}
          onDelete={(coupon) => setDeletingId(coupon.id)}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 text-[13px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} strokeWidth={2} />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`e-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-colors ${
                      p === currentPage ? 'bg-[#da2966] text-white shadow-sm font-bold' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 text-[13px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
