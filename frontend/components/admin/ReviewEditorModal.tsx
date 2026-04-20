'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Star,
  X,
  Search,
  Loader2,
} from 'lucide-react';
import {
  adminReviewService,
  adminProductService,
  AdminReview,
  AdminProduct,
} from '@/services/api';

interface ReviewEditorModalProps {
  isOpen: boolean;
  review?: AdminReview | null;
  onClose: () => void;
  onSuccess: () => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

/**
 * Extracted Modal Component for Adding/Editing Reviews
 * Isolates all modal state from parent page component
 * Prevents full-page re-renders during text input
 */
export default function ReviewEditorModal({
  isOpen,
  review,
  onClose,
  onSuccess,
}: ReviewEditorModalProps) {
  // ── Form state ───────────────────────────────────────────────────────────
  const [editName, setEditName] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editBody, setEditBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);

  // ── Product selection state ──────────────────────────────────────────────
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editProductName, setEditProductName] = useState<string>('');
  const [productQuery, setProductQuery] = useState('');
  const [productOptions, setProductOptions] = useState<AdminProduct[]>([]);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearching, setProductSearching] = useState(false);
  
  // ── Product search AbortController (race condition prevention) ──────────
  const searchAbortRef = useRef<AbortController | null>(null);

  // ── Initialize form from review prop ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    
    if (review && review.id) {
      setEditName(review.reviewer_name);
      setEditRating(review.rating);
      setEditBody(review.body ?? '');
      setEditProductId(review.product?.id ?? null);
      setEditProductName(review.product?.name ?? '');
    } else {
      setEditName('');
      setEditRating(0);
      setEditBody('');
      setEditProductId(null);
      setEditProductName('');
    }
    
    setEditImages([]);
    setEditImagePreviews([]);
    setSaveError(null);
    setProductQuery('');
    setProductOptions([]);
  }, [isOpen, review]);

  // ── Product search with AbortController (prevent race conditions) ────────
  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProductOptions([]);
      setProductSearchOpen(false);
      return;
    }

    // Abort any pending requests
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    searchAbortRef.current = new AbortController();
    setProductSearching(true);

    try {
      const res = await adminProductService.list(
        {
          search: q,
          per_page: 8,
        },
        searchAbortRef.current.signal
      );
      setProductOptions(res.data);
      setProductSearchOpen(true);
    } catch (err: any) {
      // Silently ignore AbortError
      if (err.name !== 'AbortError') {
        console.error('[ReviewEditorModal] Product search failed:', err);
      }
    } finally {
      setProductSearching(false);
    }
  }, []);

  // ── Debounced product search ─────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => searchProducts(productQuery), 350);
    return () => clearTimeout(t);
  }, [productQuery, searchProducts]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      // Revoke object URLs
      editImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      // Abort pending fetches
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, [editImagePreviews]);

  const selectProduct = (p: AdminProduct) => {
    setEditProductId(p.id);
    setEditProductName(p.name);
    setProductQuery('');
    setProductOptions([]);
    setProductSearchOpen(false);
  };

  const clearProduct = () => {
    setEditProductId(null);
    setEditProductName('');
    setProductQuery('');
    setProductOptions([]);
    setProductSearchOpen(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    editImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setEditImages(files);
    setEditImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || editRating === 0) {
      setSaveError('Name and rating are required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    const isNew = !review?.id;

    try {
      if (isNew) {
        if (editImages.length > 0) {
          const fd = new FormData();
          fd.append('reviewer_name', editName.trim());
          fd.append('rating', String(editRating));
          if (editBody.trim()) fd.append('body', editBody.trim());
          if (editProductId) fd.append('product_id', String(editProductId));
          editImages.forEach((img) => fd.append('images[]', img));
          await adminReviewService.create(fd);
        } else {
          await adminReviewService.create({
            reviewer_name: editName.trim(),
            rating: editRating,
            body: editBody.trim() || null,
            product_id: editProductId,
          });
        }
      } else if (review?.id) {
        await adminReviewService.update(review.id, {
          reviewer_name: editName.trim(),
          rating: editRating,
          body: editBody.trim() || null,
          product_id: editProductId,
        });
      }

      onSuccess();
      onClose();
    } catch (e: unknown) {
      console.error(e);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[24px] sm:rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto shadow-2xl border border-gray-100 w-full max-w-[480px] overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Star
              size={18}
              className="text-[#da2966] fill-[#da2966]"
            />
            <h3
              id="modal-title"
              className="text-[17px] font-bold text-[#da2966]"
            >
              {review?.id ? 'Edit Review' : 'Add Review'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-[#da2966] focus:outline-none"
            aria-label="Close modal"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g Ayoub laghzal"
              className="w-full px-4 py-3 border border-gray-200 rounded-[10px] text-[14px] text-[#333] placeholder-gray-300 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-colors"
            />
          </div>

          {/* Product (optional) */}
          <div>
            <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Produit{' '}
              <span className="text-gray-300 font-normal normal-case">
                (optionnel — laisser vide pour avis homepage)
              </span>
            </label>
            {editProductId ? (
              <div className="flex items-center gap-3 px-4 py-3 border border-[#da2966]/30 rounded-[10px] bg-[#fdf9fa]">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#111] truncate">
                    {editProductName}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Produit sélectionné
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearProduct}
                  className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  onFocus={() => {
                    if (productOptions.length > 0) setProductSearchOpen(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setProductSearchOpen(false), 150)
                  }
                  placeholder="Search product…"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-[10px] text-[14px] text-[#333] placeholder-gray-300 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-colors"
                />
                {productSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#da2966] border-t-transparent rounded-full animate-spin" />
                )}
                {productSearchOpen && productOptions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-[10px] shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {productOptions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={() => selectProduct(p)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#fdf2f4] transition-colors"
                      >
                        {p.primary_image && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.primary_image}
                              alt=""
                              className="w-8 h-8 rounded-[6px] object-cover border border-gray-100 shrink-0"
                            />
                          </>
                        )}
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#111] truncate">
                            {p.name}
                          </p>
                          {p.brand && (
                            <p className="text-[11px] text-gray-400 truncate">
                              {p.brand.name}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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

          {/* Image Upload (add mode only) */}
          {!review?.id && (
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Photos{' '}
                <span className="text-gray-300 font-normal normal-case">
                  (optionnel)
                </span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-[10px] cursor-pointer hover:border-[#da2966] hover:bg-[#fdf9fa] transition-colors">
                <span className="text-[13px] text-gray-400 font-medium">
                  Cliquer pour ajouter des photos
                </span>
                <span className="text-[11px] text-gray-300 mt-0.5">
                  JPG · PNG · WEBP
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
              {editImagePreviews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {editImagePreviews.map((src, i) => (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={i}
                        src={src}
                        alt={`preview-${i}`}
                        className="w-14 h-14 object-cover rounded-[8px] border border-gray-200"
                      />
                    </>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Date (read-only display) */}
          {review?.id && (
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Date Review
              </label>
              <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-[10px] bg-gray-50">
                <span className="text-[14px] text-gray-500">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
          )}

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
                      className={
                        filled
                          ? 'text-[#b09d6d] fill-[#b09d6d]'
                          : 'text-gray-200 fill-gray-200'
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          {saveError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium">
              <X size={14} strokeWidth={2.5} className="shrink-0" />
              {saveError}
            </div>
          )}
          <button
            onClick={handleSaveEdit}
            disabled={
              isSaving || !editName.trim() || editRating === 0
            }
            className="w-full py-3.5 rounded-[10px] bg-[#1a1310] text-white text-[14px] font-bold tracking-wide hover:bg-[#2d2624] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : review?.id ? (
              '+ Save Changes'
            ) : (
              '+ Add Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
