'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminSelect } from '@/components/admin/AdminSelect';
import dynamicImport from 'next/dynamic';
import type { ReviewFormSaveData } from '@/components/admin/ReviewFormModal';
import {
  adminReviewService,
  AdminReview,
  AdminReviewStats,
} from '@/services/api';
import { useReviewList } from '@/hooks/useReviewList';
import ReviewTable from '@/components/ReviewTable';
import {
  Star,
  TrendingUp,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Search,
  Check,
  Eye,
  X,
  MessageSquare,
  Edit3,
  Users,
  LayoutList,
} from 'lucide-react';

// ── Lazy load the modal to reduce initial bundle ────────────────────────────
const ReviewFormModal = dynamicImport(
  () => import('@/components/admin/ReviewFormModal'),
  { ssr: false }
);


// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '??';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  // ── View toggle ─────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<'reviews' | 'feedback'>('reviews');

  // ── Filter / search state ───────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState<'newest' | 'oldest'>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // ── Pagination state ────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ── Delete confirmation state ───────────────────────────────────────────────
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // ── Simplified modal state (extracted to ReviewEditorModal component) ────────
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const [stats, setStats]         = useState<AdminReviewStats | null>(null);

  // ── Fetch reviews with React Query ──────────────────────────────────────────
  const { reviews, meta, isLoading, refetch } = useReviewList({
    page: currentPage,
    limit: 25,
    ...(ratingFilter && { rating: ratingFilter }),
    ...(search.trim() && { search: search.trim() }),
    sort: sortBy,
    source: activeView === 'feedback' ? 'client' : 'admin',
    ...(activeView === 'reviews' && { status: 'approved' }),
  });

  const totalPages = meta?.last_page ?? 1;
  const totalCount = meta?.total ?? 0;
  const perPage = meta?.per_page ?? 25;

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminReviewService.stats();
        setStats(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  // Reset to page 1 when view/search/sort/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, ratingFilter, activeView]);

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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ── Moderation actions ──────────────────────────────────────────────────────
  const handleApprove = async (id: number) => {
    setActionLoading(id);
    const element = document.getElementById(`review-${id}`);
    try {
      await adminReviewService.approve(id);
      refetch();
      // Refresh stats
      const res = await adminReviewService.stats();
      setStats(res);
      // Scroll back to review
      setTimeout(() => {
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    const element = document.getElementById(`review-${id}`);
    try {
      await adminReviewService.reject(id);
      refetch();
      // Refresh stats
      const res = await adminReviewService.stats();
      setStats(res);
      // Scroll back to review
      setTimeout(() => {
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTraiter = async (id: number) => {
    setActionLoading(id);
    const element = document.getElementById(`review-${id}`);
    const scrollPosition = element?.getBoundingClientRect().top || 0;
    try {
      await adminReviewService.traiter(id);
      refetch();
      // Refresh stats
      const res = await adminReviewService.stats();
      setStats(res);
      // Scroll back to review
      setTimeout(() => {
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Toggle approve/reject based on current state ────────────────────────────
  const handleApproveToggle = async (review: AdminReview) => {
    if (review.is_approved) {
      await handleReject(review.id);
    } else {
      await handleApprove(review.id);
    }
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    setIsDeleting(true);
    const element = document.getElementById(`review-${deletingId}`);
    try {
      await adminReviewService.destroy(deletingId);
      setDeletingId(null);
      refetch();
      // Refresh stats
      const res = await adminReviewService.stats();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Modal save handler ───────────────────────────────────────────────────
  const handleModalSave = async (data: ReviewFormSaveData) => {
    if (selectedReviewId) {
      await adminReviewService.update(selectedReviewId, {
        reviewer_name: data.reviewer_name,
        rating: data.rating,
      });
    } else {
      if (data.photoFile) {
        const fd = new FormData();
        fd.append('reviewer_name', data.reviewer_name);
        fd.append('rating', String(data.rating));
        if (data.date) fd.append('date', data.date);
        fd.append('images[]', data.photoFile);
        await adminReviewService.create(fd);
      } else {
        await adminReviewService.create({
          reviewer_name: data.reviewer_name,
          rating: data.rating,
          date: data.date,
        });
      }
    }
    handleModalSuccess();
  };

  // ── Modal handlers ──────────────────────────────────────────────────────────
  const openEditModal = (review: AdminReview) => {
    setSelectedReviewId(review.id);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedReviewId(null);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedReviewId(null);
    refetch();
    // Refresh stats
    adminReviewService.stats().then(setStats).catch(console.error);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 sm:p-8 max-w-[1240px] mx-auto w-full">

      {/* ── Loading overlay ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── ReviewFormModal (lazy-loaded) ── */}
      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReviewId(null);
        }}
        onSave={handleModalSave}
        initialData={selectedReviewId ? (() => {
          const r = reviews.find(rv => rv.id === selectedReviewId);
          return r ? {
            reviewer_name: r.reviewer_name,
            rating: r.rating,
            date: r.created_at ? r.created_at.split('T')[0] : '',
          } : null;
        })() : null}
      />

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deletingId !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-4 sm:p-6 w-full max-w-[360px]">
            <div className="flex items-center justify-between mb-4">
              <h3 id="delete-dialog-title" className="text-[16px] font-bold text-[#111]">Supprimer l'avis</h3>
              <button 
                onClick={() => setDeletingId(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#da2966] rounded-full p-1"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[14px] text-gray-500 mb-6">
              Cet avis sera définitivement supprimé. Cette action ne peut pas être annulée.
            </p>
            <div className="flex items-center gap-3">
              <button
                autoFocus
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-[8px] border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-[8px] bg-red-500 text-white text-[14px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {isDeleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-[32px] font-serif font-bold text-[#111] tracking-tight mb-2">
            Gestion des avis
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Analysez les performances et organisez les meilleurs commentaires de votre marque
          </p>
        </div>

        {/* Header action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          {/* Ajouter un avis — only in reviews tab */}
          {activeView === 'reviews' && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1310] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#2d2624] transition-colors shadow-sm whitespace-nowrap"
            >
              <span className="text-[16px] leading-none">+</span>
              Ajouter un avis
            </button>
          )}

          {/* View toggle buttons */}
          <div className="flex items-center bg-gray-100 rounded-[10px] p-1 gap-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveView('reviews')}
              className={`flex-1 justify-center sm:flex-none flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${
                activeView === 'reviews'
                  ? 'bg-white text-[#1a1310] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutList size={14} />
              Avis publiés
            </button>
            <button
              onClick={() => setActiveView('feedback')}
              className={`flex-1 justify-center sm:flex-none flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${
                activeView === 'feedback'
                  ? 'bg-[#da2966] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={14} />
              Feedback clients
              {stats && stats.pending > 0 && activeView !== 'feedback' && (
                <span className="ml-1 bg-[#da2966] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:p-6 mb-10">

        {/* Card 1: Global Average */}
        <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-7 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[56px] h-[56px] rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966]">
              <Star size={24} fill="currentColor" />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-3 py-1 rounded-[6px] text-[13px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              Live
            </div>
          </div>
          <p className="text-[14px] text-gray-400 font-bold mb-2">Note moyenne globale</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-[38px] font-serif font-bold text-[#111] tracking-tighter">
              {stats ? stats.average_rating.toFixed(1) : <span className='h-8 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
            </h2>
            <span className="text-[16px] sm:text-[18px] sm:text-[20px] font-serif text-[#da2966] font-bold">/5.0</span>
          </div>
          <p className="text-[12px] text-gray-400 mt-2 font-medium flex items-center h-4">
            {stats ? `${stats.total.toLocaleString()} avis au total` : <span className="h-3 w-20 bg-gray-200 rounded animate-pulse inline-block" />}
          </p>
        </div>

        {/* Card 2: Pending Moderation */}
        <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-7 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[56px] h-[56px] rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966]">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            {stats && stats.pending > 0 && (
              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-[6px] text-[13px] font-bold">
                {stats.pending} en attente
              </div>
            )}
          </div>
          <p className="text-[14px] text-gray-400 font-bold mb-2">Pending Moderation</p>
          <h2 className="text-[38px] font-serif font-bold text-[#111] tracking-tighter">
            {stats ? stats.pending.toLocaleString() : <span className='h-8 w-16 bg-gray-200 rounded animate-pulse inline-block align-middle' />}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2 font-medium flex items-center h-4">
            {stats
              ? `${(stats.total - stats.pending).toLocaleString()} approved`
              : <span className="h-3 w-20 bg-gray-200 rounded animate-pulse inline-block" />}
          </p>
        </div>

        {/* Card 3: Most Reviewed */}
        <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-7 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[56px] h-[56px] rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966] overflow-hidden border border-[#f2e6ea] relative">
              {stats?.most_reviewed?.product_image ? (
                <Image 
                  src={stats.most_reviewed.product_image.startsWith('http') ? stats.most_reviewed.product_image : '/' + stats.most_reviewed.product_image}
                  alt={stats.most_reviewed.product_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <MessageSquare size={24} strokeWidth={2.5} />
              )}
            </div>
          </div>
          <p className="text-[14px] text-gray-400 font-bold mb-2">Most Reviewed</p>
          <h2 className="text-[38px] font-serif font-bold text-[#111] tracking-tighter truncate">
            {stats
              ? (stats.most_reviewed?.product_name ?? '—')
              : <span className="h-6 w-32 bg-gray-200 rounded animate-pulse inline-block" />}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2 font-medium flex items-center h-4">
            {stats?.most_reviewed
              ? `${stats.most_reviewed.count} reviews`
              : stats ? 'No data yet' : <span className="h-3 w-20 bg-gray-200 rounded animate-pulse inline-block" />}
          </p>
        </div>

      </div>

      {/* ─── Table Section (reviews view) ─────────────────────────────────── */}
      {activeView === 'reviews' && (
      <div className="bg-white rounded-[20px] border border-[#f2e6ea] shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">

        {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-[16px] font-bold text-[#111]">Avis Publiés en accueil</h3>
            <span className="text-[13px] text-gray-400 font-medium">
              {totalCount === 0
                ? 'No reviews'
                : `Showing ${paginationFrom}–${paginationTo} of ${totalCount.toLocaleString()}`}
            </span>
          </div>

          {/* ── 3 Filters row ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            {/* 1 — Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search reviewer or comment…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-[8px] text-[13px] text-[#333] placeholder-gray-400 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* 2 — Sort by date */}
            <AdminSelect
              variant="compact"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            >
              <option value="newest">Date: Newest first</option>
              <option value="oldest">Date: Oldest first</option>
            </AdminSelect>

            {/* 3 — Star filter (5★ 4★ 3★ only) */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-[8px] px-2 py-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 whitespace-nowrap">Stars</span>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-[13px] font-bold border transition-colors whitespace-nowrap whitespace-nowrap ${
                    ratingFilter === star
                      ? 'bg-[#da2966] text-white border-[#da2966]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#da2966] hover:text-[#da2966]'
                  }`}
                >
                  <Star size={11} fill="currentColor" />
                  {star}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <ReviewTable
            reviews={reviews}
            isLoading={isLoading}
            onApproveToggle={handleApproveToggle}
            onEdit={openEditModal}
            onDelete={(review) => setDeletingId(review.id)}
            actionLoading={actionLoading}
          />
        </div>

        {/* ── Pagination ────────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between bg-white">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 text-[14px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {pageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-[14px]">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-medium transition-colors ${
                      p === currentPage
                        ? 'bg-[#da2966] text-white shadow-md font-bold'
                        : 'text-gray-500 hover:bg-gray-100'
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
              className="flex items-center gap-1.5 text-[14px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}

      </div>
      )} {/* end reviews view */}

      {/* ─── Feedback Clients View ───────────────────────────────────────────── */}
      {activeView === 'feedback' && (
        <div>
          {/* Toolbar */}
          <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-5 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search client name or comment…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-[8px] text-[13px] text-[#333] placeholder-gray-400 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966]"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>
              {/* Sort */}
              <AdminSelect
                variant="compact"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              >
                <option value="newest">Date: Newest first</option>
                <option value="oldest">Date: Oldest first</option>
              </AdminSelect>
              {/* Stars */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-[8px] px-2 py-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 whitespace-nowrap">Stars</span>
                {[5, 4, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-[13px] font-bold border transition-colors whitespace-nowrap ${
                      ratingFilter === star
                        ? 'bg-[#da2966] text-white border-[#da2966]'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#da2966] hover:text-[#da2966]'
                    }`}
                  >
                    <Star size={11} fill="currentColor" />
                    {star}
                  </button>
                ))}
              </div>
              <span className="text-[13px] text-gray-400 font-medium whitespace-nowrap self-center">
                {totalCount === 0 ? 'No feedback' : `${totalCount.toLocaleString()} reviews`}
              </span>
            </div>
          </div>

          {/* Cards */}
          {reviews.length === 0 && !isLoading ? (
            <div className="bg-white rounded-[20px] border border-[#f2e6ea] py-20 flex flex-col items-center gap-3 text-gray-400">
              <Users size={40} strokeWidth={1.5} />
              <p className="text-[15px] font-medium">No client feedback found</p>
              {(search || ratingFilter) && (
                <button
                  onClick={() => { setSearch(''); setRatingFilter(null); }}
                  className="text-[13px] text-[#da2966] font-semibold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isActing = actionLoading === review.id;
                return (
                  <div key={review.id} id={`review-${review.id}`} className="bg-white rounded-[16px] border border-[#f2e6ea] p-4 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center text-[14px] font-bold shrink-0 border-2 border-white shadow-sm">
                        {getInitials(review.reviewer_name)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-bold text-[#111] text-[15px]">{review.reviewer_name}</p>
                            {review.customer_phone && (
                              <p className="text-[12px] text-gray-500 mt-0.5">{review.customer_phone}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[12px] text-gray-400">{formatDate(review.created_at)}</span>
                            {review.status === 'traiter' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Traiter
                              </span>
                            ) : review.is_approved ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Approuvé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> En attente
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stars + product */}
                        <div className="flex items-center gap-3 mt-2.5">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? 'text-[#b09d6d] fill-[#b09d6d]' : 'text-gray-200 fill-gray-200'} />
                            ))}
                          </div>
                          {review.product && (
                            <span className="text-[12px] font-semibold text-[#423835] bg-[#fdf8f4] border border-[#ede0d4] px-2.5 py-0.5 rounded-[5px] truncate max-w-[200px]">
                              {review.product.name}
                            </span>
                          )}
                        </div>

                        {/* Message */}
                        {review.body && (
                          <div className="mt-3 bg-gray-50 rounded-[10px] px-4 py-3 border-l-[3px] border-[#da2966]">
                            <p className="text-[13px] text-gray-700 leading-relaxed">{review.body}</p>
                          </div>
                        )}

                        {/* Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {review.images.map((img, i) => (
                              <div key={i} className="w-20 h-20 rounded-[8px] overflow-hidden border border-gray-100 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                          {!review.is_approved && review.status !== 'traiter' ? (
                            review.rating <= 2 ? (
                              <button
                                onClick={() => handleTraiter(review.id)}
                                disabled={isActing}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[7px] bg-blue-50 text-blue-700 border border-blue-200 text-[12px] font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                              >
                                <Check size={13} strokeWidth={2.5} /> Traiter
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApprove(review.id)}
                                disabled={isActing}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[7px] bg-green-50 text-green-700 border border-green-200 text-[12px] font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                <Check size={13} strokeWidth={2.5} /> Approuver
                              </button>
                            )
                          ) : review.status === 'traiter' ? (
                            <button
                              onClick={() => handleReject(review.id)}
                              disabled={isActing}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-[7px] bg-red-50 text-red-700 border border-red-200 text-[12px] font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <X size={13} strokeWidth={2.5} /> Rejeter
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReject(review.id)}
                              disabled={isActing}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-[7px] bg-yellow-50 text-yellow-700 border border-yellow-200 text-[12px] font-bold hover:bg-yellow-100 transition-colors disabled:opacity-50"
                            >
                              <X size={13} strokeWidth={2.5} /> Rejeter
                            </button>
                          )}
                          <button
                            onClick={() => setDeletingId(review.id)}
                            disabled={isActing}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-[7px] bg-red-50 text-red-500 border border-red-100 text-[12px] font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={13} strokeWidth={2.5} /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 text-[14px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} strokeWidth={2.5} /> Previous
              </button>
              <div className="flex items-center gap-2">
                {pageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`e-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-[14px]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-medium transition-colors ${
                        p === currentPage ? 'bg-[#da2966] text-white shadow-md font-bold' : 'text-gray-500 hover:bg-gray-100'
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
                className="flex items-center gap-1.5 text-[14px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      )} {/* end feedback view */}

    </div>
  );
}
