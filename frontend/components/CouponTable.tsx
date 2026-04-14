/**
 * CouponTable Component
 * Reusable table component for displaying coupons
 * Wraps DataTable with coupon-specific columns and rendering logic
 */

import React from 'react';
import Link from 'next/link';
import { AdminCoupon } from '@/services/api';
import DataTable, { type Column } from '@/components/DataTable';
import { getStatusBadge, getStatusDot, getStatusLabel } from '@/lib/config/statuses';
import { Edit3, Trash2, Check, Ticket } from 'lucide-react';

interface CouponTableProps {
  /** Array of coupons to display */
  coupons: AdminCoupon[];
  /** Current sort field */
  sortBy?: string;
  /** Current sort order */
  sortOrder?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (field: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Callback for toggle active action */
  onToggleActive?: (coupon: AdminCoupon) => void;
  /** Callback for delete action */
  onDelete?: (coupon: AdminCoupon) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();
}

function isExpiredDate(iso: string | null): boolean {
  return iso ? new Date(iso) < new Date() : false;
}

export function getCouponStatus(
  coupon: AdminCoupon
): 'active' | 'expired' | 'exhausted' | 'archived' {
  if (coupon.is_expired) return 'expired';
  if (!coupon.is_active) return 'archived';
  if (coupon.is_exhausted) return 'exhausted';
  return 'active';
}

// ─── CouponTable Component ────────────────────────────────────────────────────

export function CouponTable({
  coupons,
  sortBy,
  sortOrder = 'asc',
  onSort,
  isLoading = false,
  onToggleActive,
  onDelete,
}: CouponTableProps) {
  // ─── Column Definitions ────────────────────────────────────────────────────

  const columns: Column<AdminCoupon>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      className: 'w-[15%]',
      render: (coupon: AdminCoupon) => (
        <span className="bg-[#f4f6fa] text-[#111] font-extrabold text-[13px] px-3 py-1.5 rounded-[4px] tracking-wide font-mono">
          {coupon.code}
        </span>
      ),
    },

    {
      key: 'company_name',
      label: 'Company',
      sortable: true,
      className: 'w-[13%]',
      render: (coupon: AdminCoupon) => (
        <span className="text-[13px] text-gray-600 font-medium">
          {coupon.company_name || '—'}
        </span>
      ),
    },

    {
      key: 'type',
      label: 'Type',
      sortable: false,
      className: 'w-[12%]',
      render: (coupon: AdminCoupon) => (
        <span
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap ${
            coupon.promo_type === 'Influencers'
              ? 'bg-purple-100 text-purple-600'
              : coupon.promo_type === 'Top Client'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {coupon.promo_type}
        </span>
      ),
    },

    {
      key: 'value',
      label: 'Value',
      sortable: true,
      className: 'w-[12%]',
      render: (coupon: AdminCoupon) => (
        <span className="text-[14px] font-bold text-[#111]">
          {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} DH`}
        </span>
      ),
    },

    {
      key: 'expires_at',
      label: 'Expiry',
      sortable: true,
      className: 'w-[13%]',
      render: (coupon: AdminCoupon) => {
        if (!coupon.expires_at) {
          return <span className="text-[13px] text-gray-400 italic">Never</span>;
        }
        const isExpired = isExpiredDate(coupon.expires_at);
        return (
          <span className={`text-[13px] font-medium ${isExpired ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
            {isExpired ? 'Expired' : formatDate(coupon.expires_at)}
          </span>
        );
      },
    },

    {
      key: 'usage',
      label: 'Usage',
      sortable: false,
      className: 'w-[15%]',
      render: (coupon: AdminCoupon) => {
        if (coupon.usage_limit) {
          const usagePercent = Math.round(
            (coupon.used_count / coupon.usage_limit) * 100
          );
          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>{coupon.used_count}/{coupon.usage_limit}</span>
                <span>{usagePercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-[3px]">
                <div
                  className="bg-[#da2966] h-[3px] rounded-full"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          );
        }
        return <span className="text-[13px] text-gray-500">{coupon.used_count} uses</span>;
      },
    },

    {
      key: 'status',
      label: 'Status',
      sortable: false,
      className: 'w-[13%]',
      render: (coupon: AdminCoupon) => {
        const status = getCouponStatus(coupon);
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold ${getStatusBadge(status, 'coupon')}`}>
            <span className={`w-2 h-2 rounded-full ${getStatusDot(status, 'coupon')}`} />
            {getStatusLabel(status, 'coupon')}
          </span>
        );
      },
    },

    {
      key: 'actions',
      label: 'Actions',
      className: 'w-[12%]',
      render: (coupon: AdminCoupon) => (
        <div className="flex items-center gap-2">
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(coupon)}
              title={coupon.is_active ? 'Deactivate' : 'Activate'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                coupon.is_active
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <Check size={15} strokeWidth={2.5} />
            </button>
          )}
          <Link
            href={`/admin/dashboard/coupons/${coupon.id}/edit`}
            title="Edit"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#fdf2f4] hover:text-[#da2966] transition-all"
          >
            <Edit3 size={15} strokeWidth={2.5} />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(coupon)}
              title="Delete"
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <Trash2 size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DataTable<AdminCoupon>
      data={coupons}
      columns={columns}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      isLoading={isLoading}
      tableClassName="w-full text-left border-collapse"
      headerClassName="bg-[#fffcfd]"
      emptyMessage="No coupons found"
      rowClassName="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
      renderMobileCard={(coupon: AdminCoupon) => {
        const isExpired = isExpiredDate(coupon.expires_at);
        const status = getCouponStatus(coupon);
        
        let usagePercent = 0;
        if (coupon.usage_limit) {
          usagePercent = Math.round((coupon.used_count / coupon.usage_limit) * 100);
        }

        return (
          <div className="flex flex-col gap-3 p-4 bg-white rounded-xl mb-3 border border-gray-100 shadow-sm relative overflow-hidden group">
            {/* Header: Code & Status */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-[#fdf2f4] text-[#da2966] flex items-center justify-center flex-shrink-0">
                      <Ticket size={16} strokeWidth={2} />
                   </div>
                   <span className="bg-[#f4f6fa] text-[#111] font-extrabold text-[14px] px-2.5 py-1 rounded-[6px] tracking-wide font-mono border border-gray-200 shadow-sm">
                    {coupon.code}
                   </span>
                </div>
                <span className="text-[12px] text-gray-500 font-medium ml-10">
                  {coupon.company_name || '—'}
                </span>
              </div>
               <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${getStatusBadge(status, 'coupon').replace('rounded-full', 'rounded-md')}`}>
                {getStatusLabel(status, 'coupon')}
               </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-1 bg-gray-50/50 rounded-lg p-3 border border-gray-100/50">
               {/* Value */}
              <div>
                <span className="block text-[11px] text-gray-500 font-medium mb-0.5">Value</span>
                <span className="text-[14px] font-bold text-[#111]">
                   {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} DH`}
                </span>
                <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-gray-200 text-gray-600">
                  {coupon.promo_type}
                </span>
              </div>
              
              {/* Expiry */}
              <div>
                <span className="block text-[11px] text-gray-500 font-medium mb-0.5">Expires</span>
                 {!coupon.expires_at ? (
                    <span className="text-[13px] text-gray-400 italic font-medium">Never</span>
                  ) : (
                    <span className={`text-[13px] font-bold ${isExpired ? 'text-red-500' : 'text-[#111]'}`}>
                       {isExpired ? 'Expired' : formatDate(coupon.expires_at)}
                    </span>
                  )}
              </div>

                {/* Usage */}
                <div className="flex flex-col justify-center">
                    <span className="block text-[11px] text-gray-500 font-medium mb-1">Usage</span>
                     {coupon.usage_limit ? (
                       <div className="flex flex-col gap-1 w-full">
                          <div className="flex justify-between items-end text-[10px] text-gray-500 font-bold leading-none">
                            <span>{coupon.used_count}/{coupon.usage_limit}</span>
                            <span className="text-[#da2966]">{usagePercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-[4px] overflow-hidden">
                            <div
                              className="bg-[#da2966] h-full rounded-full transition-all duration-500"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                     ) : (
                       <span className="text-[13px] font-semibold text-[#111]">{coupon.used_count} uses</span>
                     )}
                </div>
            </div>

            {/* Approval indicator stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${coupon.is_active ? 'bg-green-400' : 'bg-gray-300'}`} />

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 mt-1">
              {onToggleActive && (
                 <button
                 onClick={(e) => { e.stopPropagation(); onToggleActive(coupon); }}
                 title={coupon.is_active ? 'Deactivate' : 'Activate'}
                  className={`flex-1 h-9 rounded-lg flex items-center justify-center gap-1.5 text-[13px] font-medium transition-all border ${
                   coupon.is_active
                     ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                     : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                 }`}
               >
                 <Check size={15} strokeWidth={2.5} />
                 {coupon.is_active ? 'Désactiver' : 'Activer'}
               </button>
              )}
              
              <div className="flex gap-2">
                 <Link
                    href={`/admin/dashboard/coupons/${coupon.id}/edit`}
                    title="Edit"
                    className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-[#fdf2f4] hover:text-[#da2966] hover:border-[#fdf2f4] transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit3 size={15} strokeWidth={2.5} />
                  </Link>
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(coupon); }}
                    className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                  >
                    <Trash2 size={15} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

export default CouponTable;
