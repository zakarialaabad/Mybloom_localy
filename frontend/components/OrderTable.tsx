/**
 * OrderTable Component
 * Reusable table component for displaying orders
 * Wraps DataTable with order-specific columns and rendering logic
 */

import React from 'react';
import { AdminOrder } from '@/services/api';
import DataTable, { type Column } from '@/components/DataTable';
import { getStatusBadge, getStatusDot, getStatusLabel } from '@/lib/config/statuses';
import { formatDate, formatCurrency, getInitials, capitalize } from '@/lib/utils';
import { Eye, MoreVertical } from 'lucide-react';

interface OrderTableProps {
  /** Array of orders to display */
  orders: AdminOrder[];
  /** Current sort field */
  sortBy?: string;
  /** Current sort order */
  sortOrder?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (field: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Show/hide view button */
  onViewOrder?: (order: AdminOrder) => void;
  /** Show/hide edit status button */
  onEditStatus?: (order: AdminOrder) => void;
}

export function OrderTable({
  orders,
  sortBy,
  sortOrder = 'asc',
  onSort,
  isLoading = false,
  onViewOrder,
  onEditStatus,
}: OrderTableProps) {
  // ─── Column Definitions ────────────────────────────────────────────────────

  const columns: Column<AdminOrder>[] = [
    {
      key: 'order_number',
      label: 'Order ID',
      sortable: true,
      className: 'w-[15%]',
      render: (order: AdminOrder) => (
        <span className="text-[14px] font-bold text-[#222]">{order.order_number}</span>
      ),
    },

    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true,
      className: 'w-[25%]',
      render: (order: AdminOrder) => (
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center font-bold text-[13px] flex-shrink-0">
            {getInitials(order.customer_name)}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-bold text-[#333] truncate">{order.customer_name}</span>
              <span className="text-[12px] text-gray-400 mt-0.5 truncate">{order.customer_phone}</span>
            </div>
        </div>
      ),
    },

    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      className: 'w-[12%]',
      render: (order: AdminOrder) => (
        <span className="text-[12px] text-gray-500 font-medium uppercase">
          {formatDate(order.created_at, 'short')}
        </span>
      ),
    },

    {
      key: 'items_count',
      label: 'Items',
      sortable: true,
      className: 'w-[10%]',
      render: (order: AdminOrder) => (
        <span className="text-[14px] text-gray-500">
          {order.items_count} item{order.items_count !== 1 ? 's' : ''}
        </span>
      ),
    },

    {
      key: 'total',
      label: 'Total',
      sortable: true,
      className: 'w-[12%]',
      render: (order: AdminOrder) => (
        <span className="text-[14px] font-semibold text-[#222]">
          {formatCurrency(order.total, 'MAD')}
        </span>
      ),
    },

    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-[15%]',
      render: (order: AdminOrder) => (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusBadge(order.status, 'order')}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusDot(order.status, 'order')}`}></span>
          {getStatusLabel(order.status, 'order')}
        </div>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      className: 'w-[11%]',
      render: (order: AdminOrder) => (
        <div className="flex items-center gap-2">
          {onViewOrder && (
            <button
              title="View order details"
              onClick={() => onViewOrder(order)}
              className="w-8 h-8 rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966] hover:bg-[#faeef1] transition-colors"
            >
              <Eye size={16} strokeWidth={2.5} />
            </button>
          )}
          {onEditStatus && (
            <button
              title="Change status"
              onClick={() => onEditStatus(order)}
              className="w-8 h-8 rounded-full text-gray-400 hover:bg-[#fdf2f4] hover:text-[#da2966] flex items-center justify-center transition-colors"
            >
              <MoreVertical size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<AdminOrder>
      data={orders}
      columns={columns}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      isLoading={isLoading}
      tableClassName="text-left border-collapse"
      headerClassName="bg-[#fffcfd]"
      emptyMessage="No orders found"
      rowClassName="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
      renderMobileCard={(order) => (
        <div className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => onViewOrder?.(order)}>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-[#111]">{order.order_number}</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusBadge(order.status, 'order')}`}>
              <span className={`w-1 h-1 rounded-full shrink-0 ${getStatusDot(order.status, 'order')}`}></span>
              {getStatusLabel(order.status, 'order')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center font-bold text-[13px] shrink-0">
              {getInitials(order.customer_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#333] truncate">{order.customer_name}</p>
              <p className="text-[12px] text-gray-500 mt-0.5 truncate">{order.customer_phone}</p>
            </div>
            {onEditStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStatus(order);
                }}
                className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#da2966] flex items-center justify-center transition-colors shrink-0"
              >
                <MoreVertical size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-400 font-medium">DATE &amp; ITEMS</span>
              <span className="text-[12px] font-medium text-gray-600 mt-0.5">
                {formatDate(order.created_at, 'short')} • {order.items_count} item{order.items_count !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-[15px] font-bold text-[#da2966]">{formatCurrency(order.total, 'MAD')}</span>
          </div>
        </div>
      )}
    />
  );
}

export default OrderTable;
