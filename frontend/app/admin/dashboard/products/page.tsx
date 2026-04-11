'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  adminProductService,
  adminCategoryService,
  adminProductTypeService,
  AdminProduct,
} from '@/services/api';
import { useProductList } from '@/hooks/useProductList';
import ProductTable from '@/components/ProductTable';
import { PRODUCT_CONFIG } from '@/lib/utils';
import { AdminSelect } from '@/components/admin/AdminSelect';

/* ═══════════════════════════════════════════════════════════════════════════
 * VIRTUAL STOCK SYSTEM
 * Stock value comes from the database.
 * Status (Active / Low Stock / Inactive) is computed here — never stored.
 * ═══════════════════════════════════════════════════════════════════════════ */

const ITEMS_PER_PAGE = 15;

type StockStatus = 'active' | 'low_stock' | 'inactive';

function stockStatus(stock: number): StockStatus {
  if (stock === 0) return 'inactive';
  if (stock <= PRODUCT_CONFIG.LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'active';
}

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-t-[24px] sm:rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto p-7 w-full max-w-sm shadow-xl mx-4">
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
  const router = useRouter();
  const [categories,   setCategories]   = useState<{ id: number; name: string }[]>([]);
  const [productTypes, setProductTypes] = useState<{ id: number; name: string }[]>([]);
  const [error,        setError]        = useState<string | null>(null);

  const [search,         setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter,     setTypeFilter]     = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');

  const [currentPage,  setCurrentPage]  = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleteBusy,   setDeleteBusy]   = useState(false);

  /* ── Fetch products with React Query ────────────────────────────────────── */
  const { products, isLoading, refetch } = useProductList({ limit: 200 });

  /* ── Refetch products on page mount to ensure fresh data ─────────────────── */
  useEffect(() => {
    refetch();
  }, [refetch]);

  /* ── Fetch categories and types ─────────────────────────────────────────── */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await adminCategoryService.list();
        setCategories(cats);
      } catch {
        // non-fatal
      }
    };

    const fetchProductTypes = async () => {
      try {
        const types = await adminProductTypeService.list();
        setProductTypes(types);
      } catch {
        // non-fatal
      }
    };

    fetchCategories();
    fetchProductTypes();
  }, []);

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
      setDeleteTarget(null);
      refetch();
    } catch {
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleteBusy(false);
    }
  };

  /* ── Table callbacks ────────────────────────────────────────────────────── */

  const handleEdit = (product: AdminProduct) => {
    router.push(`/admin/dashboard/products/${product.id}/edit`);
  };

  const handleDeleteClick = (product: AdminProduct) => {
    setDeleteTarget(product);
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 min-h-screen bg-[#fefbfb]">

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: stats.total,     color: 'text-[#1a1a1a]' },
            { label: 'Active',         value: stats.active,    color: 'text-green-600'  },
            { label: 'Low Stock',      value: stats.low_stock, color: 'text-orange-500' },
            { label: 'Inactive',       value: stats.inactive,  color: 'text-gray-400'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-t-[24px] sm:rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto border border-gray-100 px-4 py-4 md:px-5 shadow-sm flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2 sm:gap-0">
              <span className="text-[12px] sm:text-[13px] font-medium text-gray-400 leading-tight">{label}</span>
              <span className={`text-[20px] sm:text-[22px] font-extrabold ${color}`}>
                {isLoading ? <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" /> : value}
            </span>
          </div>
        ))}
      </div>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* FILTERS ROW */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:max-w-[380px]">
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
          
          <div className="flex gap-2 w-full overflow-x-auto pb-1 -mx-1 px-1 sm:px-0 sm:pb-0 sm:mx-0 sm:overflow-visible sm:w-auto no-scrollbar">
            <AdminSelect
              variant="filter"
              wrapperClassName="flex-1 sm:flex-none min-w-[130px]"
              className="sm:min-w-[160px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </AdminSelect>

            <AdminSelect
              variant="filter"
              wrapperClassName="flex-1 sm:flex-none min-w-[130px]"
              className="sm:min-w-[150px]"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {productTypes.map((t) => (
                <option key={t.id} value={String(t.id)}>{t.name}</option>
              ))}
            </AdminSelect>

            <AdminSelect
              variant="filter"
              wrapperClassName="flex-1 sm:flex-none min-w-[130px]"
              className="sm:min-w-[160px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="low_stock">Low Stock</option>
              <option value="inactive">Inactive</option>
            </AdminSelect>
          </div>

          {!isLoading && (
            <span className="text-[13px] text-gray-400 sm:ml-auto whitespace-nowrap">
              {filtered.length === products.length
                ? `${products.length} products`
                : `${filtered.length} of ${products.length} products`}
            </span>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-t-[24px] sm:rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <ProductTable
            products={paginated}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* PAGINATION */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-1 gap-4">
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
          <div className="flex flex-wrap justify-center items-center gap-1.5">
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
