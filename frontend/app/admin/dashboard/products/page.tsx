'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  adminProductService,
  adminCategoryService,
  adminProductTypeService,
  AdminProduct,
} from '@/services/api';

/* ═══════════════════════════════════════════════════════════════════════════
 * VIRTUAL STOCK SYSTEM
 * Stock value comes from the database.
 * Status (Active / Low Stock / Inactive) is computed here — never stored.
 * ═══════════════════════════════════════════════════════════════════════════ */

const LOW_STOCK_THRESHOLD = 10;
const ITEMS_PER_PAGE      = 15;

type StockStatus = 'active' | 'low_stock' | 'inactive';

function stockStatus(stock: number): StockStatus {
  if (stock === 0)                  return 'inactive';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'active';
}

function stockLabel(stock: number): { text: string; cls: string } {
  const s = stockStatus(stock);
  if (s === 'active')    return { text: `${stock} in stock`,    cls: 'text-[#333]' };
  if (s === 'low_stock') return { text: `${String(stock).padStart(2, '0')} low stock`, cls: 'text-orange-500 font-bold' };
  return                        { text: '0 out of stock',        cls: 'text-red-500 font-bold' };
}

const STATUS_META: Record<StockStatus, { label: string; dot: string; text: string }> = {
  active:    { label: 'Active',    dot: 'bg-green-500',  text: 'text-green-600 font-bold'  },
  low_stock: { label: 'Low Stock', dot: 'bg-orange-400', text: 'text-orange-500 font-bold' },
  inactive:  { label: 'Inactive',  dot: 'bg-gray-400',   text: 'text-gray-400'             },
};

/* ═══════════════════════════════════════════════════════════════════════════
 * ICONS
 * ═══════════════════════════════════════════════════════════════════════════ */

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4 5.5l3 3 3-3" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8.25" stroke="#bbb" strokeWidth="1.5" />
      <path d="M6 12l1.5-1.5 4-4-1.5-1.5-4 4L6 12z M11.5 5l1.5 1.5"
        stroke="#888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ color = '#888' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8.25" stroke="#bbb" strokeWidth="1.5" />
      <path d="M6 7h6M7.5 7V6a1.5 1.5 0 013 0v1M7.5 9v3M10.5 9v3"
        stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ProductThumb({ src }: { src?: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="w-11 h-11 rounded-xl object-cover border border-gray-200 shrink-0" />
    );
  }
  return (
    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="13" rx="2" stroke="#ccc" strokeWidth="1.5" fill="none" />
        <path d="M9 8V6a3 3 0 016 0v2" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="14" r="2" fill="#ddd" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SKELETON
 * ═══════════════════════════════════════════════════════════════════════════ */

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-40 bg-gray-100 animate-pulse rounded" />
            <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
          </div>
          <div className="w-20 h-3 bg-gray-100 animate-pulse rounded" />
          <div className="w-16 h-3 bg-gray-100 animate-pulse rounded" />
          <div className="w-20 h-3 bg-gray-100 animate-pulse rounded" />
          <div className="w-16 h-3 bg-gray-100 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DELETE MODAL
 * ═══════════════════════════════════════════════════════════════════════════ */

function DeleteModal({
  product,
  onConfirm,
  onCancel,
  busy,
}: {
  product: AdminProduct;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl mx-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 7h8M9 7V5a2 2 0 014 0v2M7 7l1 13h8l1-13"
              stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-[16px] font-bold text-center text-[#1a1a1a] mb-2">Delete Product</h3>
        <p className="text-[13px] text-gray-500 text-center mb-6">
          Are you sure you want to delete <span className="font-semibold text-[#1a1a1a]">{product.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#333] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 h-10 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function ProductsPage() {
  const [products,   setProducts]   = useState<AdminProduct[]>([]);
  const [categories,   setCategories]   = useState<{ id: number; name: string }[]>([]);
  const [productTypes, setProductTypes] = useState<{ id: number; name: string }[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const [search,         setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter,     setTypeFilter]     = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');

  const [currentPage,  setCurrentPage]  = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleteBusy,   setDeleteBusy]   = useState(false);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminProductService.list({ per_page: 200 });
      setProducts(res.data);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await adminCategoryService.list();
      setCategories(cats);
    } catch {
      // non-fatal
    }
  }, []);

  const fetchProductTypes = useCallback(async () => {
    try {
      const types = await adminProductTypeService.list();
      setProductTypes(types);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchProductTypes();
  }, [fetchProducts, fetchCategories, fetchProductTypes]);

  /* ── Filtered list (client-side) ───────────────────────────────────────── */

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (q && !(
        p.name.toLowerCase().includes(q) ||
        (p.subtitle ?? '').toLowerCase().includes(q) ||
        (p.category?.name ?? '').toLowerCase().includes(q)
      )) return false;
      if (categoryFilter && String(p.category?.id ?? '') !== categoryFilter) return false;
      if (typeFilter     && String(p.product_type?.id ?? '') !== typeFilter)  return false;
      if (statusFilter && stockStatus(p.stock) !== statusFilter)             return false;
      return true;
    });
  }, [products, search, categoryFilter, typeFilter, statusFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [search, categoryFilter, typeFilter, statusFilter]);

  /* ── Pagination ─────────────────────────────────────────────────────────── */

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  /* ── Stats ─────────────────────────────────────────────────────────────── */

  const stats = useMemo(() => ({
    total:     products.length,
    active:    products.filter(p => stockStatus(p.stock) === 'active').length,
    low_stock: products.filter(p => stockStatus(p.stock) === 'low_stock').length,
    inactive:  products.filter(p => stockStatus(p.stock) === 'inactive').length,
  }), [products]);

  /* ── Delete ─────────────────────────────────────────────────────────────── */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await adminProductService.destroy(deleteTarget.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleteBusy(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="px-8 py-8 space-y-6 min-h-screen bg-[#fefbfb]">

      {/* PAGE HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a1a] leading-tight">Product Management</h1>
          <p className="text-[14px] text-gray-400 mt-1">
            Manage your luxury inventory and collection listings
          </p>
        </div>
        <Link 
          href="/admin/dashboard/products/add" 
          className="flex items-center gap-2 px-5 py-3 bg-[#2b2b2b] text-white text-[14px] font-semibold rounded-xl hover:bg-[#1a1a1a] transition-colors shadow-sm"
        >
          + Add Product
        </Link>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.total,     color: 'text-[#1a1a1a]' },
          { label: 'Active',         value: stats.active,    color: 'text-green-600'  },
          { label: 'Low Stock',      value: stats.low_stock, color: 'text-orange-500' },
          { label: 'Inactive',       value: stats.inactive,  color: 'text-gray-400'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm flex items-center justify-between">
            <span className="text-[13px] font-medium text-gray-400">{label}</span>
            <span className={`text-[22px] font-extrabold ${color}`}>
              {loading ? '—' : value}
            </span>
          </div>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-5 py-4 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchProducts}
            className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTERS ROW */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-[380px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by product name or collection ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#da2966]/40 shadow-sm"
          />
        </div>

        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 focus:outline-none focus:border-[#da2966]/40 shadow-sm cursor-pointer min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronIcon />
          </span>
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 focus:outline-none focus:border-[#da2966]/40 shadow-sm cursor-pointer min-w-[150px]"
          >
            <option value="">All Types</option>
            {productTypes.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronIcon />
          </span>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 focus:outline-none focus:border-[#da2966]/40 shadow-sm cursor-pointer min-w-[160px]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronIcon />
          </span>
        </div>

        {!loading && (
          <span className="text-[13px] text-gray-400 ml-auto">
            {filtered.length === products.length
              ? `${products.length} products`
              : `${filtered.length} of ${products.length} products`}
          </span>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '220px' }} />{/* Product */}
              <col style={{ width: '100px' }} />{/* Type */}
              <col style={{ width: '130px' }} />{/* Category */}
              <col style={{ width: '110px' }} />{/* Price */}
              <col style={{ width: '90px' }} /> {/* Stock */}
              <col style={{ width: '110px' }} />{/* Status */}
              <col style={{ width: '90px' }} /> {/* Actions */}
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100">
                {['Product', 'Type', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-left text-[11px] font-extrabold text-[#da2966] uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[14px] text-gray-400">
                    {products.length === 0
                      ? 'No products found in the database.'
                      : 'No products match your filters.'}
                  </td>
                </tr>
              ) : (
                paginated.map((product) => {
                  const sl = stockLabel(product.stock);
                  const sm = STATUS_META[stockStatus(product.stock)];
                  const isDeleted = !!product.deleted_at;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#fefbfb] transition-colors ${isDeleted ? 'opacity-50' : ''}`}
                    >
                      {/* Product */}
                      <td className="px-6 py-4 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <ProductThumb src={product.primary_image} />
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-[#222] leading-tight truncate">
                              {product.name}
                            </p>
                            {product.subtitle && (
                              <p className="text-[12px] text-gray-400 mt-0.5 italic truncate">
                                {product.subtitle}
                              </p>
                            )}
                            {isDeleted && (
                              <span className="text-[10px] text-red-400 font-semibold">Deleted</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.product_type ? (
                          <span className="inline-block px-3 py-1 rounded-lg text-[12px] font-bold bg-[#f5f5f5] text-[#555] uppercase tracking-wide">
                            {product.product_type.name}
                          </span>
                        ) : (
                          <span className="text-[12px] text-gray-300">—</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.category ? (
                          <span className="inline-block px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#fff0f3] text-[#da2966]">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-[12px] text-gray-300">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] text-[#333] font-bold">
                            {Number(product.price).toFixed(2)} DH
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-[11px] text-gray-400 line-through">
                              {Number(product.original_price).toFixed(2)} DH
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className={`px-6 py-4 text-[14px] ${sl.cls}`}>
                        {sl.text}
                      </td>

                      {/* Status (virtual) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 text-[13px] ${sm.text}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${sm.dot}`} />
                          {sm.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/dashboard/products/${product.id}/edit`} className="opacity-70 hover:opacity-100 transition-opacity" title="Edit">
                            <EditIcon />
                          </Link>
                          <button
                            className="opacity-70 hover:opacity-100 transition-opacity"
                            title="Delete"
                            onClick={() => setDeleteTarget(product)}
                            disabled={isDeleted}
                          >
                            <TrashIcon color={isDeleted ? '#ddd' : '#888'} />
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
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          {/* Left: range info */}
          <span className="text-[13px] text-gray-400">
            Showing{' '}
            <span className="font-semibold text-[#1a1a1a]">
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}
            </span>
            {' '}–{' '}
            <span className="font-semibold text-[#1a1a1a]">
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
            </span>
            {' '}of{' '}
            <span className="font-semibold text-[#1a1a1a]">{filtered.length}</span>
            {' '}products
          </span>

          {/* Right: page buttons */}
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#da2966]/40 hover:text-[#da2966] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8.5 3L5 7l3.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Page numbers */}
            {(() => {
              const pages: (number | '…')[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3)             pages.push('…');
                const lo = Math.max(2, currentPage - 1);
                const hi = Math.min(totalPages - 1, currentPage + 1);
                for (let i = lo; i <= hi; i++)   pages.push(i);
                if (currentPage < totalPages - 2) pages.push('…');
                pages.push(totalPages);
              }
              return pages.map((p, idx) =>
                p === '…' ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-[13px] text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold border transition-colors shadow-sm ${
                      currentPage === p
                        ? 'bg-[#da2966] text-white border-[#da2966] shadow-[0_2px_8px_rgba(218,41,102,0.25)]'
                        : 'bg-white text-[#555] border-gray-200 hover:border-[#da2966]/40 hover:text-[#da2966]'
                    }`}
                  >
                    {p}
                  </button>
                )
              );
            })()}

            {/* Next */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#da2966]/40 hover:text-[#da2966] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 3L9 7l-3.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleteBusy}
        />
      )}
    </div>
  );
}
