/**
 * ReviewTable Component
 * Reusable table component for displaying reviews
 * Wraps DataTable with review-specific columns and rendering logic
 */

import React from 'react';
import { AdminReview } from '@/services/api';
import DataTable, { type Column } from '@/components/DataTable';
import { Star, Edit3, Trash2, MessageSquare } from 'lucide-react';

interface ReviewTableProps {
  /** Array of reviews to display */
  reviews: AdminReview[];
  /** Current sort field */
  sortBy?: string;
  /** Current sort order */
  sortOrder?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (field: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Callback for view/approve action */
  onApproveToggle?: (review: AdminReview) => void;
  /** Callback for edit action */
  onEdit?: (review: AdminReview) => void;
  /** Callback for delete action */
  onDelete?: (review: AdminReview) => void;
  /** Loading ID for action buttons */
  actionLoading?: number | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

// ─── StarRating Component ────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating
              ? 'text-[#b09d6d] fill-[#b09d6d]'
              : 'text-gray-200 fill-gray-200'
          }
        />
      ))}
    </div>
  );
}

// ─── ReviewTable Component ────────────────────────────────────────────────────

export function ReviewTable({
  reviews,
  sortBy,
  sortOrder = 'asc',
  onSort,
  isLoading = false,
  onApproveToggle,
  onEdit,
  onDelete,
  actionLoading,
}: ReviewTableProps) {
  // ─── Column Definitions ────────────────────────────────────────────────────

  const columns: Column<AdminReview>[] = [
    {
      key: 'conversation',
      label: 'Conversation',
      sortable: false,
      className: 'w-[15%]',
      render: (review: AdminReview) => (
        <div className="w-[72px] h-[72px] rounded-[10px] overflow-hidden flex-shrink-0 border border-gray-100">
          {review.images && review.images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={review.images[0].image_url}
                alt="review"
                className="w-full h-full object-cover"
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#fdf8f6] text-[#da2966]">
              <MessageSquare size={22} strokeWidth={1.5} />
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                Avis
              </span>
            </div>
          )}
        </div>
      ),
    },

    {
      key: 'reviewer_name',
      label: 'Client',
      sortable: true,
      className: 'w-[35%]',
      render: (review: AdminReview) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center text-[12px] font-bold flex-shrink-0">
            {getInitials(review.reviewer_name)}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#111] truncate">
              {review.reviewer_name}
            </p>
            <div className="flex sm:hidden gap-0.5 mt-1">
              <StarRating rating={review.rating} size={10} />
            </div>
          </div>
        </div>
      ),
    },

    {
      key: 'rating',
      label: 'Note',
      sortable: true,
      className: 'w-[12%]',
      render: (review: AdminReview) => <StarRating rating={review.rating} size={14} />,
    },

    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      className: 'w-[15%]',
      render: (review: AdminReview) => (
        <span className="text-[13px] text-gray-500">
          {formatDate(review.created_at)}
        </span>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      className: 'w-[23%]',
      render: (review: AdminReview) => {
        const isActing = actionLoading === review.id;
        
        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                disabled={isActing}
                title="Modifier"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#fdf2f4] hover:text-[#da2966] transition-all disabled:opacity-50"
              >
                <Edit3 size={15} strokeWidth={2.5} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review)}
                disabled={isActing}
                title="Supprimer"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
              >
                <Trash2 size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DataTable<AdminReview>
      data={reviews}
      columns={columns}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      isLoading={isLoading}
      tableClassName="text-left border-collapse min-w-[600px]"
      headerClassName="bg-[#fffcfd]"
      emptyMessage="No reviews found"
      rowClassName="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
      renderMobileCard={(review: AdminReview) => (
        <div className="flex flex-col gap-3 p-4 bg-white rounded-xl mb-3 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="w-[80px] h-[80px] rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 relative bg-[#FAFAFA]">
              {review.images && review.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.images[0].image_url}
                  alt="review"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#fdf8f6] text-[#da2966]">
                  <MessageSquare size={22} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    Avis
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-start py-0.5 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 overflow-hidden">
                   <div className="w-6 h-6 rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {getInitials(review.reviewer_name)}
                    </div>
                  <h3 className="text-[14px] font-bold text-gray-900 truncate">
                    {review.reviewer_name}
                  </h3>
                </div>
                <span className="text-[12px] font-medium text-gray-400 whitespace-nowrap ml-2">
                   {formatDate(review.created_at)}
                </span>
              </div>
               
              <div className="mb-2">
                 <StarRating rating={review.rating} size={12} />
              </div>

               {review.product ? (
                <span className="w-fit inline-block text-[10px] font-bold text-[#423835] bg-[#fdf8f4] border border-[#ede0d4] px-2 py-0.5 rounded-[4px] max-w-full truncate">
                  {review.product.name}
                </span>
              ) : (
                <span className="w-fit inline-block text-[10px] font-bold text-[#da2966] bg-[#fdf2f4] px-2 py-0.5 rounded-[4px]">
                  Homepage
                </span>
              )}
            </div>
             {/* Approval indicator stripe */}
             <div className={`absolute left-0 top-0 bottom-0 w-1 ${review.is_approved ? 'bg-green-400' : 'bg-gray-200'}`} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-1">
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(review); }}
                  disabled={actionLoading === review.id}
                  className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-[#fdf2f4] hover:text-[#da2966] hover:border-[#fdf2f4] transition-all"
                >
                  <Edit3 size={15} strokeWidth={2.5} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(review); }}
                  disabled={actionLoading === review.id}
                  className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                >
                  <Trash2 size={15} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    />
  );
}

export default ReviewTable;
