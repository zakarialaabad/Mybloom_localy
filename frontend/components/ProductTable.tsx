/**
 * ProductTable Component
 * Reusable table component for displaying products
 * Wraps DataTable with product-specific columns and rendering logic
 */

import React from 'react';
import Link from 'next/link';
import { AdminProduct } from '@/services/api';
import DataTable, { type Column } from '@/components/DataTable';
import { getStatusDot, getStatusLabel, PRODUCT_STOCK_STATUS_CONFIG } from '@/lib/config/statuses';
import { formatCurrency, PRODUCT_CONFIG } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';

interface ProductTableProps {
  /** Array of products to display */
  products: AdminProduct[];
  /** Current sort field */
  sortBy?: string;
  /** Current sort order */
  sortOrder?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (field: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Callback for edit action */
  onEdit?: (product: AdminProduct) => void;
  /** Callback for delete action */
  onDelete?: (product: AdminProduct) => void;
}

// ─── Stock Status Helper ────────────────────────────────────────────────────

type StockStatus = 'active' | 'low_stock' | 'inactive';

function stockStatus(stock: number): StockStatus {
  if (stock === 0) return 'inactive';
  if (stock <= PRODUCT_CONFIG.LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'active';
}

// ─── Thumbnail Component ────────────────────────────────────────────────────

function ProductThumb({ src }: { src?: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0" />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="13" rx="2" stroke="#ccc" strokeWidth="1.5" fill="none" />
        <path d="M9 8V6a3 3 0 016 0v2" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="14" r="2" fill="#ddd" />
      </svg>
    </div>
  );
}

// ─── ProductTable Component ────────────────────────────────────────────────────

export function ProductTable({
  products,
  sortBy,
  sortOrder = 'asc',
  onSort,
  isLoading = false,
  onEdit,
  onDelete,
}: ProductTableProps) {
  // ─── Column Definitions ────────────────────────────────────────────────────

  const columns: Column<AdminProduct>[] = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      className: 'w-[24%]',
      render: (product: AdminProduct) => {
        // Get the first variant size for display
        const firstVariant = product.variants?.[0];
        const sizeDisplay = firstVariant ? `${firstVariant.size}${firstVariant.unit ?? 'ml'}` : 'N/A';
        const typeDisplay = product.product_type?.name || 'No type';
        
        return (
          <div className="flex items-center gap-3 min-w-0">
            <ProductThumb src={product.primary_image} />
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-[#222] leading-tight truncate">
                {product.name}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                {typeDisplay} / Size {sizeDisplay}
              </p>
              {product.deleted_at && (
                <span className="text-[10px] text-red-400 font-semibold">Deleted</span>
              )}
            </div>
          </div>
        );
      },
    },

    {
      key: 'category',
      label: 'Category',
      sortable: false,
      className: 'w-[14%]',
      render: (product: AdminProduct) => (
        product.category ? (
          <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fff0f3] text-[#da2966]">
            {product.category.name}
          </span>
        ) : (
          <span className="text-[12px] text-gray-300">—</span>
        )
      ),
    },

    {
      key: 'price',
      label: 'Price',
      sortable: true,
      className: 'w-[13%]',
      render: (product: AdminProduct) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] text-[#333] font-bold">
            {formatCurrency(product.price, 'MAD')}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-[11px] text-gray-400 line-through">
              {formatCurrency(product.original_price, 'MAD')}
            </span>
          )}
        </div>
      ),
    },

    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      className: 'w-[12%]',
      render: (product: AdminProduct) => {
        const status = stockStatus(product.stock);
        const textClass = 
          status === 'active' ? 'text-[#333]' : 
          status === 'low_stock' ? 'text-orange-500 font-bold' : 
          'text-red-500 font-bold';
        const displayText =
          status === 'active' ? `${product.stock} in stock` : 
          status === 'low_stock' ? `${String(product.stock).padStart(2, '0')} low stock` : 
          '0 out of stock';
        
        return (
          <span className={`text-[14px] ${textClass}`}>
            {displayText}
          </span>
        );
      },
    },

    {
      key: 'status',
      label: 'Status',
      sortable: false,
      className: 'w-[13%]',
      render: (product: AdminProduct) => {
        const status = stockStatus(product.stock);
        return (
          <span className="flex items-center gap-1.5 text-[13px] font-bold">
            <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(status, 'product')}`} />
            {getStatusLabel(status, 'product')}
          </span>
        );
      },
    },

    {
      key: 'actions',
      label: 'Actions',
      className: 'w-[12%]',
      render: (product: AdminProduct) => {
        const isDeleted = !!product.deleted_at;
        
        return (
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                title="Edit product"
                onClick={() => onEdit(product)}
                className="w-8 h-8 rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966] hover:bg-[#faeef1] transition-colors disabled:opacity-50"
                disabled={isDeleted}
              >
                <Edit2 size={16} strokeWidth={2} />
              </button>
            )}
            {onDelete && (
              <button
                title="Delete product"
                onClick={() => onDelete(product)}
                className="w-8 h-8 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                disabled={isDeleted}
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DataTable<AdminProduct>
      data={products}
      columns={columns}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      isLoading={isLoading}
      tableClassName="text-left border-collapse"
      headerClassName="bg-[#fffcfd]"
      emptyMessage="No products found"
      rowClassName={(product: AdminProduct) => `border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${product.deleted_at ? 'opacity-50' : ''}`}
      renderMobileCard={(product: AdminProduct) => {
        const isDeleted = !!product.deleted_at;
        const status = stockStatus(product.stock);
        return (
          <div className={`p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer ${isDeleted ? 'opacity-50' : ''}`} onClick={() => !isDeleted && onEdit?.(product)}>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                 status === 'active' ? 'bg-green-50 text-green-600' :
                 status === 'low_stock' ? 'bg-orange-50 text-orange-600' :
                 'bg-red-50 text-red-600'
              }`}>
                <span className={`w-1 h-1 rounded-full shrink-0 ${getStatusDot(status, 'product')}`}></span>
                {getStatusLabel(status, 'product')}
              </span>
              <span className="text-[14px] font-bold text-[#da2966]">
                {formatCurrency(product.price, 'MAD')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ProductThumb src={product.primary_image} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#222] leading-tight truncate">{product.name}</p>
                {product.subtitle && (
                  <p className="text-[12px] text-gray-400 mt-0.5 italic truncate">{product.subtitle}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(product);
                    }}
                    className="w-8 h-8 rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966]"
                    disabled={isDeleted}
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(product);
                    }}
                    className="w-8 h-8 rounded-full text-gray-400 hover:text-red-500 flex items-center justify-center"
                    disabled={isDeleted}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
              <div className="flex items-center gap-2">
                {product.category && (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#fff0f3] text-[#da2966]">
                    {product.category.name}
                  </span>
                )}
                {product.product_type && (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-600">
                    {product.product_type.name}
                  </span>
                )}
              </div>
              <span className="text-[12px] font-semibold text-gray-500">
                {product.stock} in stock
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}

export default ProductTable;
