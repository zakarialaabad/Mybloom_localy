'use client';

import React, { useState, useEffect } from 'react';
import { AdminSelect } from '@/components/admin/AdminSelect';
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
  CalendarDays,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

// ─── Toast ────────────────────────────────────────────────────────────────────

type Toast = { id: number; type: 'success' | 'error'; message: string };

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-[10px] shadow-lg text-[13px] font-semibold min-w-[280px] pointer-events-auto animate-in fade-in slide-in-from-top-3 ${
            t.type === 'success'
              ? 'bg-[#eefaf3] text-[#0f8e5c] border border-[#c3edd6]'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {t.type === 'success'
            ? <CheckCircle2 size={16} strokeWidth={2.5} />
            : <AlertCircle size={16} strokeWidth={2.5} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  // ── Filter / search state ───────────────────────────────────────────────────
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [currentPage, setCurrentPage]   = useState(1);

  // ── Modal and stats state ───────────────────────────────────────────────────
  const [stats, setStats]               = useState<AdminOrderStats | null>(null);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus]       = useState('');
  const [isUpdating, setIsUpdating]     = useState(false);

  // ── Delete state ────────────────────────────────────────────────────────────
  const [deletingOrder, setDeletingOrder] = useState<AdminOrder | null>(null);
  const [isDeleting, setIsDeleting]       = useState(false);

  // ── Bulk delete by date range state ────────────────────────────────────────
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting]           = useState(false);

  // ── Toast state ─────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastCounter = 0;
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now() + (toastCounter++);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Fetch orders with React Query ───────────────────────────────────────────
  const { orders, meta, isLoading, refetch } = useOrderList({
    page: currentPage,
    limit: 25,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
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
  }, [search, statusFilter, dateFrom, dateTo]);

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
      // Update local state immediately to avoid UI "flicker"
      if (orders) {
        const idx = orders.findIndex(o => o.id === editingOrder.id);
        if (idx !== -1) orders[idx].status = newStatus;
      }
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

  const handleDeleteConfirm = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      await adminOrderService.destroy(deletingOrder.id);
      setDeletingOrder(null);
      refetch();
      const res = await adminOrderService.stats();
      setStats(res);
      showToast('success', `Commande ${deletingOrder.order_number} supprimée avec succès.`);
    } catch {
      showToast('error', 'Erreur lors de la suppression. Veuillez réessayer.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (!dateFrom || !dateTo) return;
    setIsBulkDeleting(true);
    try {
      const { deleted } = await adminOrderService.bulkDestroyByDateRange(dateFrom, dateTo);
      setShowBulkDeleteModal(false);
      setDateFrom('');
      setDateTo('');
      refetch();
      const res = await adminOrderService.stats();
      setStats(res);
      showToast('success', `${deleted} commande${deleted !== 1 ? 's' : ''} supprimée${deleted !== 1 ? 's' : ''} avec succès.`);
    } catch {
      showToast('error', 'Erreur lors de la suppression. Veuillez réessayer.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 sm:p-8 max-w-[1200px] mx-auto w-full">

      {/* ── Toast notifications ──────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

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
          onClose={() => {
            setViewingOrder(null);
            refetch(); // pick up any cron-job status changes that happened while sidebar was open
          }}
          onStatusUpdated={() => { 
            refetch(); 
            adminOrderService.stats().then(setStats).catch(console.error);
          }}
        />
      )}

      {/* ── Bulk delete by date range modal ──────────────────────────────────── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-5 sm:p-6 w-[440px] mx-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <Trash2 size={18} strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-[#111]">Supprimer par période</h3>
              </div>
              <button onClick={() => setShowBulkDeleteModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Date range summary */}
            <div className="flex items-center gap-3 bg-[#fdf2f4] border border-[#faeef1] rounded-[10px] px-4 py-3 mb-4">
              <CalendarDays size={16} className="text-[#da2966] shrink-0" />
              <div className="text-[13px] font-semibold text-[#da2966]">
                {dateFrom} <span className="text-[#da2966]/50 font-normal">→</span> {dateTo}
              </div>
            </div>

            {/* Count badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-[12px] font-bold border border-red-100">
                <Trash2 size={12} strokeWidth={3} />
                {totalCount} commande{totalCount !== 1 ? 's' : ''} seront supprimée{totalCount !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-[13px] text-gray-600 bg-amber-50 border border-amber-100 rounded-[8px] px-4 py-3 mb-5">
              ⚠️ Cette action est <strong>irréversible</strong>. Toutes les commandes dans cette période seront définitivement supprimées.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-[8px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={isBulkDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 rounded-[8px] text-[13px] font-bold text-white hover:bg-red-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {isBulkDeleting ? 'Suppression…' : `Supprimer ${totalCount} commande${totalCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deletingOrder && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-5 sm:p-6 w-[400px] mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <Trash2 size={18} strokeWidth={2.5} />
                </div>
                <h3 className="text-[15px] font-bold text-[#111]">Supprimer la commande</h3>
              </div>
              <button onClick={() => setDeletingOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-[13px] text-gray-500 mb-1 ml-[52px]">
              Commande <span className="font-bold text-[#da2966]">{deletingOrder.order_number}</span>
            </p>
            <p className="text-[13px] text-gray-400 mb-5 ml-[52px]">{deletingOrder.customer_name}</p>
            <p className="text-[13px] text-gray-600 bg-red-50/60 border border-red-100 rounded-[8px] px-4 py-3 mb-5">
              Cette action est <strong>irréversible</strong>. La commande et son historique seront définitivement supprimés.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingOrder(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-[8px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 rounded-[8px] text-[13px] font-bold text-white hover:bg-red-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status-update modal ──────────────────────────────────────────────── */}
      {editingOrder && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-4 sm:p-6 w-[380px] mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#111]">Modifier le statut de la commande</h3>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-[13px] text-gray-500 mb-1">
              Order <span className="font-bold text-[#da2966]">{editingOrder.order_number}</span>
            </p>
            <p className="text-[13px] text-gray-400 mb-5">{editingOrder.customer_name}</p>

            <AdminSelect
              variant="compact"
              wrapperClassName="mb-5"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Sélectionner le nouveau statut…</option>
              {VALID_STATUSES.map((s) => (
                <option key={s} value={s}>{capitalize(s)}</option>
              ))}
            </AdminSelect>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-[8px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || newStatus === editingOrder.status || isUpdating}
                className="flex-1 px-4 py-2.5 bg-[#da2966] rounded-[8px] text-[13px] font-bold text-white hover:bg-[#b11b4e] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {isUpdating ? 'Mise à jour…' : 'Mettre à jour le statut'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-serif font-bold text-[#111] tracking-tight mb-2">
          Gestion des commandes
        </h1>
        <p className="text-[14px] text-gray-500">
          Gérez et suivez les commandes des clients sur tous les canaux. Priorisez les livraisons en attente et revérifiez les articles livrés.
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
          <p className="text-[14px] text-gray-500 font-medium mb-1">Toutes les commandes</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.total.count.toLocaleString() : <div className='h-8 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">vs mois dernier</p>
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
          <p className="text-[14px] text-gray-500 font-medium mb-1">Confirmé</p>
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
          <p className="text-[14px] text-gray-500 font-medium mb-1">Livré</p>
          <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">
            {stats ? stats.delivered.count.toLocaleString() : <div className='h-8 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

      </div>

      {/* ── Orders table area ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] border border-[#f2e6ea] shadow-[0_2px_15px_rgba(0,0,0,0.02)]">

        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100">
          {/* Row 1 — filters + count */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">

              {/* Status filter */}
              <AdminSelect
                variant="filter"
                wrapperClassName="w-full sm:w-auto shrink-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>{capitalize(s)}</option>
                ))}
              </AdminSelect>

              {/* Search */}
              <div className="relative w-full sm:w-[260px] shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={15} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nom, téléphone ou numéro…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-[8px] text-[13px] focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Date range card */}
              <div className={`flex items-center gap-0 rounded-[8px] border transition-all overflow-hidden shrink-0 ${
                dateFrom || dateTo
                  ? 'border-[#da2966] shadow-[0_0_0_3px_rgba(218,41,102,0.08)]'
                  : 'border-gray-200'
              }`}>
                {/* Left accent + icon */}
                <div className={`flex items-center gap-2 px-3 py-2 border-r text-[12px] font-semibold whitespace-nowrap transition-colors ${
                  dateFrom || dateTo
                    ? 'border-[#da2966]/20 bg-[#fdf2f4] text-[#da2966]'
                    : 'border-gray-100 bg-gray-50 text-gray-400'
                }`}>
                  <CalendarDays size={14} strokeWidth={2.5} />
                  <span>Période</span>
                </div>

                {/* From date */}
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2.5 py-2 text-[12px] text-gray-600 border-none outline-none bg-white w-[130px]"
                />

                {/* Separator */}
                <span className="text-gray-300 text-[13px] font-light select-none">—</span>

                {/* To date */}
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2.5 py-2 text-[12px] text-gray-600 border-none outline-none bg-white w-[130px]"
                />

                {/* Clear — only when active */}
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                    className="flex items-center justify-center w-7 h-7 mr-1 rounded-full bg-[#faeef1] text-[#da2966] hover:bg-[#da2966] hover:text-white transition-colors shrink-0"
                    title="Effacer les dates"
                  >
                    <X size={11} strokeWidth={3} />
                  </button>
                )}
              </div>

              {/* Bulk delete button — appears only when full range is set */}
              {dateFrom && dateTo && (
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold transition-colors shrink-0 shadow-sm"
                >
                  <Trash2 size={13} strokeWidth={2.5} />
                  Supprimer la période
                </button>
              )}
            </div>

            {/* Result count */}
            <div className="text-[13px] text-gray-500 font-medium whitespace-nowrap self-end lg:self-auto">
              {isLoading
                ? <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                : totalCount > 0
                  ? `Affichage ${paginationFrom}–${paginationTo} sur ${totalCount.toLocaleString()}`
                  : 'Aucun résultat'}
            </div>
          </div>
        </div>

        {/* Table */}
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onViewOrder={(order) => setViewingOrder(order)}
          onEditStatus={(order) => openEditModal(order)}
          onDeleteOrder={(order) => setDeletingOrder(order)}
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
              Précédent
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
              Suivant
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
