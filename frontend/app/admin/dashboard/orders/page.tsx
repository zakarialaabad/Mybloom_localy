'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminOrderService, AdminOrder, AdminOrderStats } from '@/services/api';
import OrderDetailsSidebar from './components/OrderDetailsSidebar';
import {
  Search,
  Eye,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ListTodo,
  ClipboardCheck,
  PackageCheck,
  X,
  ChevronDown,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':   return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    case 'confirmed': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'preparing': return 'bg-orange-50 text-orange-700 border border-orange-200';
    case 'delivered': return 'bg-green-50 text-green-700 border border-green-200';
    case 'shipped':   return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200';
    default:          return 'bg-gray-50 text-gray-600 border border-gray-200';
  }
};

const getStatusDotClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':   return 'bg-yellow-500';
    case 'confirmed': return 'bg-blue-500';
    case 'preparing': return 'bg-orange-500';
    case 'delivered': return 'bg-green-500';
    case 'shipped':   return 'bg-purple-500';
    case 'cancelled': return 'bg-red-500';
    default:          return 'bg-gray-400';
  }
};

const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatTrend = (trend: number) => {
  if (trend > 0) return `+${trend}%`;
  if (trend < 0) return `${trend}%`;
  return '0%';
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [orders, setOrders]       = useState<AdminOrder[]>([]);
  const [stats, setStats]         = useState<AdminOrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filter / search state ───────────────────────────────────────────────────
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Pagination state ────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [perPage, setPerPage]         = useState(25);

  // ── Status-update modal state ───────────────────────────────────────────────
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus]       = useState('');
  const [isUpdating, setIsUpdating]     = useState(false);

  // ── Fetch orders ────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page };
      if (search)       params['search'] = search;
      if (statusFilter) params['status'] = statusFilter;

      const res = await adminOrderService.list(params);
      setOrders(res.data);
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

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminOrderService.stats();
      setStats(res);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Debounce search & filter; always reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => { fetchOrders(1); }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pagination helpers ──────────────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchOrders(page);
  };

  const pageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const paginationFrom = totalCount === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const paginationTo   = Math.min(currentPage * perPage, totalCount);

  // ── Status-update modal ─────────────────────────────────────────────────────
  const openEditModal = (order: AdminOrder) => {
    setEditingOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusUpdate = async () => {
    if (!editingOrder || !newStatus) return;
    setIsUpdating(true);
    try {
      await adminOrderService.updateStatus(editingOrder.id, newStatus);
      setEditingOrder(null);
      setNewStatus('');
      fetchOrders(currentPage);
      fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full">

      {/* ── Loading overlay ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── View order sidebar ──────────────────────────────────────────────── */}
      {viewingOrder && (
        <OrderDetailsSidebar
          orderId={viewingOrder.id}
          onClose={() => setViewingOrder(null)}
          onStatusUpdated={() => { fetchOrders(currentPage); fetchStats(); }}
        />
      )}

      {/* ── Status-update modal ──────────────────────────────────────────────── */}
      {editingOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-6 w-[380px] mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#111]">Update Order Status</h3>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-[13px] text-gray-500 mb-1">
              Order <span className="font-bold text-[#da2966]">{editingOrder.order_number}</span>
            </p>
            <p className="text-[13px] text-gray-400 mb-5">{editingOrder.customer_name}</p>

            <div className="relative mb-5">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-[8px] text-[14px] text-[#333] focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] cursor-pointer"
              >
                <option value="">Select new status…</option>
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>{capitalize(s)}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-[8px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || newStatus === editingOrder.status || isUpdating}
                className="flex-1 px-4 py-2.5 bg-[#da2966] rounded-[8px] text-[13px] font-bold text-white hover:bg-[#b11b4e] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {isUpdating ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-serif font-bold text-[#111] tracking-tight mb-2">
          Order Management
        </h1>
        <p className="text-[14px] text-gray-500">
          Manage and track customer orders across all channels. Prioritize pending shipments and review delivered items.
        </p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Card — Total orders */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <ListTodo size={24} strokeWidth={2.5} />
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[12px] font-bold ${
              (stats?.total.trend ?? 0) >= 0 ? 'bg-[#eefaf3] text-[#0f8e5c]' : 'bg-red-50 text-red-600'
            }`}>
              {(stats?.total.trend ?? 0) >= 0
                ? <TrendingUp size={14} strokeWidth={3} />
                : <TrendingDown size={14} strokeWidth={3} />}
              {formatTrend(stats?.total.trend ?? 0)}
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">All Orders</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.total.count.toLocaleString() : '—'}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

        {/* Card — Confirmed */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <ClipboardCheck size={24} strokeWidth={2.5} />
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[12px] font-bold ${
              (stats?.confirmed.trend ?? 0) >= 0 ? 'bg-[#eefaf3] text-[#0f8e5c]' : 'bg-red-50 text-red-600'
            }`}>
              {(stats?.confirmed.trend ?? 0) >= 0
                ? <TrendingUp size={14} strokeWidth={3} />
                : <TrendingDown size={14} strokeWidth={3} />}
              {formatTrend(stats?.confirmed.trend ?? 0)}
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Confirmed</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.confirmed.count.toLocaleString() : '—'}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

        {/* Card — Delivered */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <PackageCheck size={24} strokeWidth={2.5} />
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[12px] font-bold ${
              (stats?.delivered.trend ?? 0) >= 0 ? 'bg-[#eefaf3] text-[#0f8e5c]' : 'bg-red-50 text-red-600'
            }`}>
              {(stats?.delivered.trend ?? 0) >= 0
                ? <TrendingUp size={14} strokeWidth={3} />
                : <TrendingDown size={14} strokeWidth={3} />}
              {formatTrend(stats?.delivered.trend ?? 0)}
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Delivered</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.delivered.count.toLocaleString() : '—'}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

      </div>

      {/* ── Orders table area ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] border border-[#f2e6ea] shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">

        {/* Toolbar */}
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 border border-gray-200 rounded-[8px] text-[13px] font-bold text-[#444] hover:bg-gray-50 focus:outline-none focus:border-[#da2966] transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>{capitalize(s)}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[220px] md:w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone, or order #…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-[8px] text-[13px] focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <div className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
            {isLoading
              ? 'Loading…'
              : totalCount > 0
                ? `Showing ${paginationFrom}–${paginationTo} of ${totalCount.toLocaleString()}`
                : 'No results'}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fffcfd]">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Order ID</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Items</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Total</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="w-14 h-14 rounded-full bg-[#fdf2f4] flex items-center justify-center">
                        <ClipboardCheck size={24} className="text-[#da2966] opacity-40" />
                      </div>
                      <p className="text-[14px] font-medium">No orders found</p>
                      {(search || statusFilter) && (
                        <button
                          onClick={() => { setSearch(''); setStatusFilter(''); }}
                          className="text-[13px] text-[#da2966] font-bold hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">

                    {/* Order ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[14px] font-bold text-[#222]">{order.order_number}</span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-[38px] h-[38px] rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                          {getInitials(order.customer_name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#333]">{order.customer_name}</span>
                          <span className="text-[12px] text-gray-400 mt-0.5">{order.customer_phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[12px] text-gray-500 font-medium uppercase">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[14px] text-gray-500">
                        {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[14px] font-semibold text-[#222]">
                        {Number(order.total).toFixed(2)} Dhs
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusBadgeClass(order.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusDotClass(order.status)}`} />
                        {capitalize(order.status)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          title="View order details"                            onClick={() => setViewingOrder(order)}                          className="w-8 h-8 rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966] hover:bg-[#faeef1] transition-colors"
                        >
                          <Eye size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          title="Change status"
                          onClick={() => openEditModal(order)}
                          className="w-8 h-8 rounded-full text-gray-400 hover:bg-[#fdf2f4] hover:text-[#da2966] flex items-center justify-center transition-colors"
                        >
                          <MoreVertical size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1.5 text-[13px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft size={16} strokeWidth={2} />
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {pageNumbers().map((page, i) =>
                page === '...' ? (
                  <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-8 h-8 rounded-full text-[13px] font-bold transition-colors ${
                      page === currentPage
                        ? 'bg-[#da2966] text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1.5 text-[13px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
