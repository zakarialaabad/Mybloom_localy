'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';

// ── Hide scrollbar styles ─────────────────────────────────────────────────────
const SCROLLBAR_HIDE_STYLES = `
  .scrollbar-hide {
    -ms-overflow-style: none;      /* IE & Edge */
    scrollbar-width: none;         /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;                 /* Chrome & Safari */
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReviewFormSaveData {
  reviewer_name: string;
  rating: number;
  date: string;
  photoFile: File | null;
}

export interface ReviewFormInitialData {
  reviewer_name?: string;
  rating?: number;
  date?: string;
}

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called on submit. Return a Promise to show loading state.
   * Throw an error to display an error message.
   */
  onSave: (data: ReviewFormSaveData) => Promise<void> | void;
  /** Pre-fill fields for edit mode */
  initialData?: ReviewFormInitialData | null;
  /** Override the submit button label */
  submitLabel?: string;
}

// ── Brand Icons ─────────────────────────────────────────────────────────────

const StarFilledIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill="#da2966"
      stroke="#da2966"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const CloudUploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 16V12M7 12L5 14M7 12L9 14"
      stroke="#da2966"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 16.2C21.2 15.6 22 14.4 22 13c0-2-1.5-3.5-3.5-3.5h-.4C17.3 6.9 14.8 5 12 5c-3.3 0-6 2.7-6 6 0 .2 0 .4.1.6C4.4 11.9 3 13.3 3 15c0 1.6 1.3 3 3 3h13c1.7 0 3-1.3 3-3z"
      fill="#da2966"
      stroke="#da2966"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReviewFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  submitLabel,
}: ReviewFormModalProps) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName]               = useState('');
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [date, setDate]               = useState('');
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving]       = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // ── Product search state — removed (field no longer shown) ————————
  const searchAbortRef = useRef<AbortController | null>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  // ── Lock body scroll when modal is open ───────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Inject scrollbar-hide styles once ────────────────────────────────────
  useEffect(() => {
    if (document.getElementById('__review-scrollbar-hide')) return;
    const s = document.createElement('style');
    s.id = '__review-scrollbar-hide';
    s.textContent = SCROLLBAR_HIDE_STYLES;
    document.head.appendChild(s);
  }, []);

  // ── Reset / populate form when modal opens ─────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setName(initialData?.reviewer_name ?? '');
    setRating(initialData?.rating ?? 0);
    setDate(initialData?.date ?? new Date().toISOString().split('T')[0]);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError(null);
    setHoverRating(0);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup object URLs ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      searchAbortRef.current?.abort();
    };
  }, [photoPreview]);

  // ── Photo handler ─────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSave({
        reviewer_name: name.trim(),
        rating,
        date: date || new Date().toISOString().split('T')[0],
        photoFile,
      });
      onClose();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (e instanceof Error ? e.message : 'An error occurred. Please try again.');
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!(initialData?.reviewer_name);
    const defaultLabel = isEditing ? '+ Save Changes' : '+ Add Review';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-form-modal-title"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-[480px] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center pt-5 pb-4 border-b border-gray-100 shrink-0">
          {/* Drag handle (mobile) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 bg-gray-200 rounded-full sm:hidden" />
          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            <StarFilledIcon />
            <h3
              id="review-form-modal-title"
              className="text-[17px] font-bold text-[#da2966]"
            >
                            {isEditing ? "Edit Review" : 'Add Review'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-1/2 -translate-y-1/2 mt-0.5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#da2966]"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-5 sm:p-7 space-y-5">

            {/* Customer Photo */}
            <div>
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Customer Photo{' '}
                <span className="text-gray-300 font-normal normal-case">(optionnel)</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-[#da2966]/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#fff0f3] transition-colors gap-2"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="preview"
                    className="h-20 w-20 object-cover rounded-xl"
                  />
                ) : (
                  <>
                    <CloudUploadIcon />
                    <p className="text-[13px] text-[#333] font-medium">
                      Drag &amp; drop or click to upload
                    </p>
                    <p className="text-[11px] text-gray-400">JPG · PNG · WEBP</p>
                  </>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Full Name
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g Ayoub laghzal"
                className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#da2966]/40"
              />
            </div>

            {/* Date Review */}
            <div>
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Date Review
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40 appearance-none"
              />
            </div>

            {/* Star Rating */}
            <div>
              <p className="text-[11px] font-extrabold text-[#888] uppercase tracking-[0.18em] text-center mb-4">
                Rate the Experience
              </p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="text-[36px] leading-none transition-transform hover:scale-110"
                    style={{ color: star <= (hoverRating || rating) ? '#facc15' : '#d1d5db' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-5 sm:px-7 pb-6 pt-3 space-y-3 border-t border-gray-100">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium">
              <X size={14} strokeWidth={2.5} className="shrink-0" />
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSaving || !name.trim() || rating === 0}
            className="w-full h-12 rounded-xl bg-[#da2966] text-white text-[14px] font-bold hover:bg-[#c22158] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              submitLabel ?? defaultLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
