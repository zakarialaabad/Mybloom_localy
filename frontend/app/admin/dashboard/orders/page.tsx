'use client';

import React, { useState, useEffect } from 'react';
import { adminOrderService, AdminOrder, AdminOrderStats } from '@/services/api';
import { useOrderList } from '@/hooks/useOrderList';
import OrderDetailsSidebar from './components/OrderDetailsSidebar';
import OrderTable from '@/components/OrderTable';
import { getStatusBadge } from '@/lib/config/statuses';
import { capitalize, formatTrend } from '@/lib/utils';
import {
  Search,
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  // ── Filter / search state ───────────────────────────────────────────────────
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage]   = useState(1);

  // ── Modal and stats state ───────────────────────────────────────────────────
  const [stats, setStats]         = useState<AdminOrderStats | null>(null);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus]       = useState('');
  const [isUpdating, setIsUpdating]     = useState(false);

  // ── Fetch orders with React Query ───────────────────────────────────────────
  const { orders, meta, isLoading, refetch } = useOrderList({
    page: currentPage,
    limit: 25,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  });

  const totalPages = meta?.last_page ?? 1;
  const totalCount = meta?.total ?? 0;
  const perPage = meta?.per_page ?? 25;

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminOrderService.stats();
        setStats(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  // ── Reset to page 1 on search/filter change ─────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ── Pagination helpers ──────────────────────────────────────────────────────
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
      refetch();
      // Refresh stats
      const res = await adminOrderService.stats();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 sm:p-8 max-w-[1200px] mx-auto w-full">

      {/* ── Loading overlay ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── View order sidebar ──────────────────────────────────────────────── */}
      {viewingOrder && (
        <OrderDetailsSidebar
          orderId={viewingOrder.id}
          onClose={() => setViewingOrder(null)}
          onStatusUpdated={() => { 
            refetch(); 
            adminOrderService.stats().then(setStats).catch(console.error);
          }}
        />
      )}

      {/* ── Status-update modal ──────────────────────────────────────────────── */}
      {editingOrder && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-4 sm:p-6 w-[380px] mx-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:p-6 mb-10">

        {/* Card — Total orders */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
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
            {stats ? stats.total.count.toLocaleString() : <div className='h-8 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

        {/* Card — Confirmed */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
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
            {stats ? stats.confirmed.count.toLocaleString() : <div className='h-8 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

        {/* Card — Delivered */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-4 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
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
            {stats ? stats.delivered.count.toLocaleString() : <div className='h-8 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

      </div>

      {/* ── Orders table area ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] border border-[#f2e6ea] shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">

            {/* Status filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-[8px] text-[13px] font-bold text-[#444] hover:bg-gray-50 focus:outline-none focus:border-[#da2966] transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>{capitalize(s)}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-[280px]">
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
          <div className="text-[13px] text-gray-500 font-medium whitespace-nowrap self-end sm:self-auto">
            {isLoading
              ? <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              : totalCount > 0
                ? `Showing ${paginationFrom}–${paginationTo} of ${totalCount.toLocaleString()}`
                : 'No results'}
          </div>
        </div>

        {/* Table */}
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onViewOrder={(order) => setViewingOrder(order)}
          onEditStatus={(order) => openEditModal(order)}
        />

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
