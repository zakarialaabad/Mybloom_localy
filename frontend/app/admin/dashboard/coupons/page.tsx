'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  adminCouponService,
  AdminCoupon,
  AdminCouponStats,
} from '@/services/api';
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  // ── Data state ────────────────────────────────────────────────────────────
  const [coupons, setCoupons]     = useState<AdminCoupon[]>([]);
  const [stats, setStats]         = useState<AdminCouponStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filter / search state ─────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [perPage, setPerPage]         = useState(20);

  // ── Delete confirmation state ──────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch coupons ──────────────────────────────────────────────────────────
  const fetchCoupons = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page };
      if (statusFilter !== 'all') params['status'] = statusFilter;
      if (search.trim()) params['search'] = search.trim();

      const res = await adminCouponService.list(params);
      setCoupons(res.data);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
      setTotalCount(res.meta.total);
      setPerPage(res.meta.per_page);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminCouponService.stats();
      setStats(res);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchCoupons(1); }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchCoupons(page);
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
      fetchCoupons(currentPage);
      fetchStats();
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
      fetchCoupons(currentPage);
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  const getStatusBadge = (coupon: AdminCoupon) => {
    if (coupon.is_expired)
      return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold bg-red-50 text-red-600 border border-red-200"><span className="w-2 h-2 rounded-full bg-red-500" />Expired</span>;
    if (!coupon.is_active)
      return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold bg-gray-100 text-gray-500 border border-gray-200"><span className="w-2 h-2 rounded-full bg-gray-400" />Inactive</span>;
    if (coupon.is_exhausted)
      return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold bg-orange-50 text-orange-600 border border-orange-200"><span className="w-2 h-2 rounded-full bg-orange-500" />Exhausted</span>;
    return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold bg-[#eefaf3] text-[#0f8e5c] border border-green-200"><span className="w-2 h-2 rounded-full bg-[#0f8e5c]" />Active</span>;
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full">

      {/* ── Loading overlay ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-6 w-[360px] mx-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Active Coupons */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
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
            {stats ? stats.active.toLocaleString() : '—'}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">
            {stats ? `${stats.total.toLocaleString()} total` : 'Loading…'}
          </p>
        </div>

        {/* Total Redemptions */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <Package size={24} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Total Redemptions</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.total_redemptions.toLocaleString() : '—'}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">Across all coupons</p>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
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
            {stats ? stats.expiring_soon.toLocaleString() : '—'}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">Within next 7 days</p>
        </div>

      </div>

      {/* ─── Codes Table ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] border border-[#f2e6ea] shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">

        {/* Toolbar */}
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-[260px]">
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
            <div className="flex items-center gap-1 bg-gray-100 rounded-[8px] p-1">
              {(['all', 'active', 'inactive', 'expired'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold capitalize transition-colors ${
                    statusFilter === s ? 'bg-white text-[#da2966] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
            {totalCount === 0 ? 'No coupons' : `Showing ${paginationFrom}–${paginationTo} of ${totalCount.toLocaleString()}`}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fffcfd]">
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Code</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Type</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Value</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Min Order</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Expiry</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Usage</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Status</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Ticket size={36} strokeWidth={1.5} />
                      <p className="text-[15px] font-medium">No coupons found</p>
                      {(search || statusFilter !== 'all') && (
                        <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="text-[13px] text-[#da2966] font-semibold hover:underline">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : coupons.map((coupon) => {
                const usagePercent = coupon.usage_limit ? Math.round((coupon.used_count / coupon.usage_limit) * 100) : null;
                return (
                  <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">

                    {/* Code */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="bg-[#f4f6fa] text-[#111] font-extrabold text-[13px] px-3 py-1.5 rounded-[4px] tracking-wide font-mono">
                        {coupon.code}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${coupon.type === 'percent' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        {coupon.type === 'percent' ? 'Percent' : 'Fixed'}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-[14px] font-bold text-[#111]">
                        {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} DH`}
                      </span>
                    </td>

                    {/* Min Order */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-[13px] text-gray-500">
                        {coupon.min_order_amount > 0 ? `${coupon.min_order_amount} DH` : '—'}
                      </span>
                    </td>

                    {/* Expiry */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      {coupon.expires_at ? (
                        <span className={`text-[13px] font-medium ${isExpiredDate(coupon.expires_at) ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                          {isExpiredDate(coupon.expires_at) ? 'Expired' : formatDate(coupon.expires_at)}
                        </span>
                      ) : (
                        <span className="text-[13px] text-gray-400 italic">Never</span>
                      )}
                    </td>

                    {/* Usage Progress */}
                    <td className="px-6 py-5 w-[160px] whitespace-nowrap">
                      {coupon.usage_limit ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                            <span>{coupon.used_count}/{coupon.usage_limit}</span>
                            <span>{usagePercent}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-[3px]">
                            <div className="bg-[#da2966] h-[3px] rounded-full" style={{ width: `${usagePercent}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[13px] text-gray-500">{coupon.used_count} uses</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(coupon)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Toggle active */}
                        <button
                          onClick={() => toggleActive(coupon)}
                          title={coupon.is_active ? 'Deactivate' : 'Activate'}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${coupon.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                        >
                          <Check size={15} strokeWidth={2.5} />
                        </button>
                        {/* Edit */}
                        <Link
                          href={`/admin/dashboard/coupons/${coupon.id}/edit`}
                          title="Edit"
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#fdf2f4] hover:text-[#da2966] transition-all"
                        >
                          <Edit3 size={15} strokeWidth={2.5} />
                        </Link>
                        {/* Delete */}
                        <button
                          onClick={() => setDeletingId(coupon.id)}
                          title="Delete"
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
