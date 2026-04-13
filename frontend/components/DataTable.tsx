/**
 * DataTable Component
 * Reusable table component with sorting, filtering, pagination support
 * Used across Orders, Products, Reviews, Coupons pages
 */

'use client';

import React, { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  /** Unique column identifier */
  key: string;
  /** Display header label */
  label: string;
  /** Custom render function for cell content */
  render?: (item: T, index: number) => ReactNode;
  /** Enable sorting on this column */
  sortable?: boolean;
  /** CSS class for column width/alignment */
  className?: string;
  /** Hide on mobile (use 'hidden md:table-cell' or similar) */
  responsive?: string;
}

export type { Column };

interface DataTableProps<T> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Current sort field */
  sortBy?: string;
  /** Sort direction ('asc' | 'desc') */
  sortOrder?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (field: string) => void;
  /** CSS class for table container */
  className?: string;
  /** CSS class for table element */
  tableClassName?: string;
  /** Loading state - shows skeleton rows */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** CSS class for row */
  rowClassName?: string | ((item: T, index: number) => string);
  /** CSS class for header */
  headerClassName?: string;
  /** Number of skeleton rows to show while loading */
  skeletonRows?: number;
  /** Function to render a card on mobile screens, bypassing the table rows */
  renderMobileCard?: (item: T, index: number) => ReactNode;
}

function SkeletonRow({ columnCount }: { columnCount: number }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      {Array.from({ length: columnCount }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  sortBy,
  sortOrder = 'asc',
  onSort,
  className = '',
  tableClassName = '',
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  rowClassName = '',
  headerClassName = '',
  skeletonRows = 5,
  renderMobileCard,
}: DataTableProps<T>) {
  const handleHeaderClick = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getRowClassName = (item: T, index: number): string => {
    const baseClass = 'border-b border-gray-100 hover:bg-gray-50/50 transition-colors';
    if (typeof rowClassName === 'function') {
      return `${baseClass} ${rowClassName(item, index)}`;
    }
    return `${baseClass} ${rowClassName}`;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* ── Desktop Table ── */}
      <div className={`w-full overflow-x-auto ${renderMobileCard ? 'hidden md:block' : ''}`}>
        <table className={`w-full text-sm ${tableClassName}`}>
          {/* Header */}
        <thead>
          <tr
            className={`border-b border-gray-200 bg-gray-50/50 ${headerClassName}`}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 font-semibold text-gray-600 uppercase tracking-wider text-[12px] ${
                  col.responsive || ''
                } ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''} ${
                  col.className?.includes('text-center') ? 'text-center' : 'text-left'
                }`}
                onClick={() => col.sortable && handleHeaderClick(col.key)}
              >
                <div className={`flex items-center gap-2 select-none ${
                  col.className?.includes('text-center') ? 'justify-center' : 'justify-start'
                }`}>
                  <span>{col.label}</span>
                  {col.sortable && sortBy === col.key && (
                    <div className="flex flex-col gap-0">
                      {sortOrder === 'asc' ? (
                        <ChevronUp size={14} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-600" />
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={i} columnCount={columns.length} />
            ))
          ) : data.length === 0 ? (
            // Empty state
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            // Data rows
            data.map((item, index) => (
              <tr
                key={item.id}
                className={getRowClassName(item, index)}
                onClick={() => onRowClick?.(item, index)}
              >
                {columns.map((col) => (
                  <td
                    key={`${item.id}-${col.key}`}
                    className={`px-6 py-4 ${col.responsive || ''} ${
                      col.className || ''
                    }`}
                  >
                    {col.render ? col.render(item, index) : '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {/* ── Mobile Cards ── */}
      {renderMobileCard && (
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <div key={i} className="p-4 flex flex-col gap-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : data.length === 0 ? (
            <div className="px-6 py-12 text-center text-[14px] text-gray-400">
              {emptyMessage}
            </div>
          ) : (
            data.map((item, index) => (
              <div key={item.id} onClick={() => onRowClick?.(item, index)} className="cursor-pointer">
                {renderMobileCard(item, index)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
