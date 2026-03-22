'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  adminReviewService,
  AdminReview,
  AdminReviewStats,
} from '@/services/api';
import {
  Star,
  TrendingUp,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Search,
  Check,
  X,
  MessageSquare,
  Edit3,
} from 'lucide-react';

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
  // ── Data state ──────────────────────────────────────────────────────────────
  const [reviews, setReviews]     = useState<AdminReview[]>([]);
  const [stats, setStats]         = useState<AdminReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filter / search state ───────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // ── Pagination state ────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [perPage, setPerPage]         = useState(25);

  // ── Delete confirmation state ───────────────────────────────────────────────
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // ── Edit modal state ────────────────────────────────────────────────────────
  const [editingReview, setEditingReview]   = useState<AdminReview | null>(null);
  const [editName, setEditName]             = useState('');
  const [editRating, setEditRating]         = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editBody, setEditBody]             = useState('');
  const [isSaving, setIsSaving]             = useState(false);

  // ── Action loading state ────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ── Fetch reviews ───────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page };
      if (statusFilter && statusFilter !== 'all') params['status'] = statusFilter;
      if (ratingFilter)  params['rating'] = ratingFilter;
      if (search.trim()) params['search'] = search.trim();

      const res = await adminReviewService.list(params);
      setReviews(res.data);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
      setTotalCount(res.meta.total);
      setPerPage(res.meta.per_page);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, ratingFilter]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminReviewService.stats();
      setStats(res);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Debounce search / filter changes; always reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => { fetchReviews(1); }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter, ratingFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pagination ──────────────────────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchReviews(page);
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

  // ── Moderation actions ──────────────────────────────────────────────────────
  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await adminReviewService.approve(id);
      fetchReviews(currentPage);
      fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await adminReviewService.reject(id);
      fetchReviews(currentPage);
      fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    setIsDeleting(true);
    try {
      await adminReviewService.destroy(deletingId);
      setDeletingId(null);
      fetchReviews(currentPage);
      fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (review: AdminReview) => {
    setEditingReview(review);
    setEditName(review.reviewer_name);
    setEditRating(review.rating);
    setEditHoverRating(0);
    setEditBody(review.body ?? '');
  };

  const closeEditModal = () => {
    setEditingReview(null);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    setIsSaving(true);
    try {
      await adminReviewService.update(editingReview.id, {
        reviewer_name: editName.trim(),
        rating: editRating,
        body: editBody.trim() || null,
      });
      closeEditModal();
      fetchReviews(currentPage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-[1240px] mx-auto w-full">

      {/* ── Loading overlay ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Edit modal ───────────────────────────────────────────────────────── */}
      {editingReview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] shadow-2xl border border-gray-100 w-[480px] mx-4 overflow-hidden">

            {/* Header */}
            <div className="relative flex items-center justify-center py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-[#da2966] fill-[#da2966]" />
                <h3 className="text-[17px] font-bold text-[#da2966]">Curated Reviews</h3>
              </div>
              <button
                onClick={closeEditModal}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g Ayoub laghzal"
                  className="w-full px-4 py-3 border border-gray-200 rounded-[10px] text-[14px] text-[#333] placeholder-gray-300 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-colors"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Comment
                </label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Customer's review text…"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-[10px] text-[14px] text-[#333] placeholder-gray-300 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-colors resize-none"
                />
              </div>

              {/* Date (read-only display) */}
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Date Review
                </label>
                <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-[10px] bg-gray-50">
                  <span className="text-[14px] text-gray-500">
                    {formatDate(editingReview.created_at)}
                  </span>
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-center">
                  Rate the Experience
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= (editHoverRating || editRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setEditHoverRating(star)}
                        onMouseLeave={() => setEditHoverRating(0)}
                        onClick={() => setEditRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={filled ? 'text-[#b09d6d] fill-[#b09d6d]' : 'text-gray-200 fill-gray-200'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editName.trim() || editRating === 0}
                className="w-full py-3.5 rounded-[10px] bg-[#1a1310] text-white text-[14px] font-bold tracking-wide hover:bg-[#2d2624] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving…' : '+ Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl border border-gray-100 p-6 w-[360px] mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[#111]">Delete Review</h3>
              <button onClick={() => setDeletingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-[14px] text-gray-500 mb-6">
              This review will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-[8px] border border-gray-200 text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-[8px] bg-red-500 text-white text-[14px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-[32px] font-serif font-bold text-[#111] tracking-tight mb-2">
            Review Management
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Analyze performance and curate your brand&apos;s best feedback
          </p>
        </div>
      </div>

      {/* ─── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

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
          <p className="text-[14px] text-gray-400 font-bold mb-2">Global Average</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-[38px] font-serif font-bold text-[#111] tracking-tighter">
              {stats ? stats.average_rating.toFixed(1) : '—'}
            </h2>
            <span className="text-[20px] font-serif text-[#da2966] font-bold">/5.0</span>
          </div>
          <p className="text-[12px] text-gray-400 mt-2 font-medium">
            {stats ? `${stats.total.toLocaleString()} total reviews` : 'Loading…'}
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
                {stats.pending} pending
              </div>
            )}
          </div>
          <p className="text-[14px] text-gray-400 font-bold mb-2">Pending Moderation</p>
          <h2 className="text-[38px] font-serif font-bold text-[#111] tracking-tighter">
            {stats ? stats.pending.toLocaleString() : '—'}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2 font-medium">
            {stats
              ? `${(stats.total - stats.pending).toLocaleString()} approved`
              : 'Loading…'}
          </p>
        </div>

        {/* Card 3: Most Reviewed */}
        <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-7 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[56px] h-[56px] rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966]">
              <MessageSquare size={24} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-[14px] text-gray-400 font-bold mb-2">Most Reviewed</p>
          <h2 className="text-[24px] font-serif font-bold text-[#111] tracking-tight line-clamp-1">
            {stats?.most_reviewed?.product_name ?? '—'}
          </h2>
          <p className="text-[12px] text-gray-400 mt-2 font-medium">
            {stats?.most_reviewed
              ? `${stats.most_reviewed.count} reviews`
              : stats ? 'No data yet' : 'Loading…'}
          </p>
        </div>

      </div>

      {/* ─── Table Section ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[20px] border border-[#f2e6ea] shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">

        {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
        <div className="p-6 border-b border-gray-100 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-[16px] font-bold text-[#111]">All Reviews</h3>
            <span className="text-[13px] text-gray-400 font-medium">
              {totalCount === 0
                ? 'No reviews'
                : `Showing ${paginationFrom}–${paginationTo} of ${totalCount.toLocaleString()}`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search reviewer or comment…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-[8px] text-[14px] text-[#333] placeholder-gray-400 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966]"
              />
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-[8px] p-1">
              {(['all', 'approved', 'pending'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-[6px] text-[13px] font-semibold capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-white text-[#da2966] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Star filter */}
            <div className="flex items-center gap-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-[8px] text-[13px] font-semibold border transition-colors ${
                    ratingFilter === star
                      ? 'bg-[#da2966] text-white border-[#da2966]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#da2966]'
                  }`}
                >
                  <Star size={12} fill="currentColor" />
                  {star}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fffcfd]">
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Reviewer</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Rating</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Comment</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Product</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Status</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Date</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <MessageSquare size={36} strokeWidth={1.5} />
                      <p className="text-[15px] font-medium">No reviews found</p>
                      {(search || statusFilter !== 'all' || ratingFilter) && (
                        <button
                          onClick={() => { setSearch(''); setStatusFilter('all'); setRatingFilter(null); }}
                          className="text-[13px] text-[#da2966] font-semibold hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const isActing = actionLoading === review.id;
                  return (
                    <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">

                      {/* Reviewer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center text-[12px] font-bold flex-shrink-0">
                            {getInitials(review.reviewer_name)}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#111]">{review.reviewer_name}</p>
                            {review.order_number && (
                              <p className="text-[11px] text-gray-400 font-mono">{review.order_number}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? 'text-[#b09d6d] fill-[#b09d6d]' : 'text-gray-200 fill-gray-200'}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-6 py-4 max-w-[260px]">
                        {review.body ? (
                          <p className="text-[13px] text-gray-600 line-clamp-2">{review.body}</p>
                        ) : (
                          <span className="text-[12px] text-gray-300 italic">No comment</span>
                        )}
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {review.product ? (
                          <span className="text-[13px] font-medium text-[#423835]">{review.product.name}</span>
                        ) : (
                          <span className="text-[12px] text-gray-300">—</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {review.is_approved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-gray-500">{formatDate(review.created_at)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {!review.is_approved ? (
                            <button
                              onClick={() => handleApprove(review.id)}
                              disabled={isActing}
                              title="Approve"
                              className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-all disabled:opacity-50"
                            >
                              <Check size={15} strokeWidth={2.5} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReject(review.id)}
                              disabled={isActing}
                              title="Reject"
                              className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 hover:bg-yellow-100 transition-all disabled:opacity-50"
                            >
                              <X size={15} strokeWidth={2.5} />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(review)}
                            disabled={isActing}
                            title="Edit"
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#fdf2f4] hover:text-[#da2966] transition-all disabled:opacity-50"
                          >
                            <Edit3 size={15} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setDeletingId(review.id)}
                            disabled={isActing}
                            title="Delete"
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={15} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white">
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
    </div>
  );
}
