'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, Tag, Award, Leaf, type LucideIcon } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import CategoryModal from '@/components/admin/catalogue/CategoryModal';
import BrandModal from '@/components/admin/catalogue/BrandModal';
import IngredientModal from '@/components/admin/catalogue/IngredientModal';
import { useCategoryList } from '@/hooks/useCategoryList';
import { useBrandList } from '@/hooks/useBrandList';
import { useIngredientList } from '@/hooks/useIngredientList';
import {
  AdminCategory, AdminBrand, AdminIngredient,
  adminCategoryService, adminBrandService, adminIngredientService,
} from '@/services/api';

type TabKey = 'categories' | 'brands' | 'ingredients';

const TABS: { key: TabKey; label: string; labelShort: string; Icon: LucideIcon; addLabel: string; emptyMsg: string }[] = [
  { key: 'categories', label: 'Catégories',  labelShort: 'Catég.',   Icon: Tag,   addLabel: '+ Catégorie',  emptyMsg: 'Aucune catégorie trouvée' },
  { key: 'brands',     label: 'Marques',      labelShort: 'Marques',  Icon: Award, addLabel: '+ Marque',     emptyMsg: 'Aucune marque trouvée' },
  { key: 'ingredients',label: 'Ingrédients',  labelShort: 'Ingréd.',  Icon: Leaf,  addLabel: '+ Ingrédient', emptyMsg: 'Aucun ingrédient trouvé' },
];

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1.5 justify-end">
      <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="w-8 h-8 rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966] hover:bg-[#faeef1] transition-colors">
        <Pencil size={13} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('categories');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<AdminIngredient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string; type: TabKey } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { categories, isLoading: loadingCats, refetch: refetchCats } = useCategoryList();
  const { brands, isLoading: loadingBrands, refetch: refetchBrands } = useBrandList();
  const { ingredients, isLoading: loadingIng, refetch: refetchIng } = useIngredientList();

  const filteredCategories = useMemo(() => categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [categories, search]);
  const filteredBrands = useMemo(() => brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())), [brands, search]);
  const filteredIngredients = useMemo(() => ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase())), [ingredients, search]);

  const handleTabChange = (tab: TabKey) => { setActiveTab(tab); setSearch(''); };

  const openAdd = () => { setEditingCategory(null); setEditingBrand(null); setEditingIngredient(null); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingCategory(null); setEditingBrand(null); setEditingIngredient(null); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'categories') { await adminCategoryService.destroy(deleteTarget.id); refetchCats(); }
      else if (deleteTarget.type === 'brands') { await adminBrandService.destroy(deleteTarget.id); refetchBrands(); }
      else { await adminIngredientService.destroy(deleteTarget.id); refetchIng(); }
      setDeleteTarget(null);
    } catch { /* keep modal open */ } finally { setDeleting(false); }
  };

  const categoryColumns: Column<AdminCategory>[] = [
    { key: 'name', label: 'Catégorie', render: (cat) => (
      <span className="text-[14px] font-bold text-[#222]">{cat.name}</span>
    )},
    { key: 'slug', label: 'Slug', responsive: 'hidden md:table-cell', render: (cat) => <span className="text-[13px] text-gray-400 font-mono">{cat.slug}</span> },
    { key: 'products_count', label: 'Produits', responsive: 'hidden lg:table-cell', render: (cat) => <span className="text-[13px] font-semibold text-gray-500">{cat.products_count ?? '—'}</span> },
    { key: 'actions', label: '', className: 'text-right w-[90px]', render: (cat) => (
      <RowActions onEdit={() => { setEditingCategory(cat); setShowModal(true); }} onDelete={() => setDeleteTarget({ id: cat.id, name: cat.name, type: 'categories' })} />
    )},
  ];

  const brandColumns: Column<AdminBrand>[] = [
    { key: 'name', label: 'Marque', render: (brand) => (
      <span className="text-[14px] font-bold text-[#222]">{brand.name}</span>
    )},
    { key: 'slug', label: 'Slug', responsive: 'hidden md:table-cell', render: (brand) => <span className="text-[13px] text-gray-400 font-mono">{brand.slug}</span> },
    { key: 'products_count', label: 'Produits', responsive: 'hidden lg:table-cell', render: (brand) => <span className="text-[13px] font-semibold text-gray-500">{brand.products_count ?? '—'}</span> },
    { key: 'actions', label: '', className: 'text-right w-[90px]', render: (brand) => (
      <RowActions onEdit={() => { setEditingBrand(brand); setShowModal(true); }} onDelete={() => setDeleteTarget({ id: brand.id, name: brand.name, type: 'brands' })} />
    )},
  ];

  const ingredientColumns: Column<AdminIngredient>[] = [
    { key: 'name', label: 'Ingrédient', render: (ing) => (
      <span className="text-[14px] font-bold text-[#222]">{ing.name}</span>
    )},
    { key: 'slug', label: 'Slug', responsive: 'hidden md:table-cell', render: (ing) => <span className="text-[13px] text-gray-400 font-mono">{ing.slug ?? '—'}</span> },
    { key: 'products_count', label: 'Produits', responsive: 'hidden lg:table-cell', render: (ing) => <span className="text-[13px] font-semibold text-gray-500">{ing.products_count ?? '—'}</span> },
    { key: 'actions', label: '', className: 'text-right w-[90px]', render: (ing) => (
      <RowActions onEdit={() => { setEditingIngredient(ing); setShowModal(true); }} onDelete={() => setDeleteTarget({ id: ing.id, name: ing.name, type: 'ingredients' })} />
    )},
  ];

  const currentTab = TABS.find(t => t.key === activeTab)!;
  const isLoading = activeTab === 'categories' ? loadingCats : activeTab === 'brands' ? loadingBrands : loadingIng;
  const totalCount = activeTab === 'categories' ? categories.length : activeTab === 'brands' ? brands.length : ingredients.length;
  const currentCount = activeTab === 'categories' ? filteredCategories.length : activeTab === 'brands' ? filteredBrands.length : filteredIngredients.length;

  return (
    <div className="min-h-screen bg-[#fefbfb] pb-24 lg:pb-8">

      {/* Header */}
      <div className="px-4 pt-6 pb-5 md:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[24px] md:text-[28px] font-bold text-[#1a1a1a] leading-tight">Gestion du Catalogue</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Catégories · Marques · Ingrédients</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2b2b2b] text-white text-[13px] font-semibold hover:bg-[#1a1a1a] transition-colors shrink-0 shadow-sm">
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">{currentTab.addLabel}</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 md:px-6 lg:px-8 mb-5">
        <div className="inline-flex bg-[#f3f3f3] rounded-[16px] p-1 gap-0.5">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all duration-200 ${
                  isActive ? 'bg-white text-[#da2966] shadow-sm' : 'text-gray-500 hover:text-[#333]'
                }`}>
                <tab.Icon size={14} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#da2966]' : 'text-gray-400'} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.labelShort}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="px-4 md:px-6 lg:px-8 mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm">
          <span className="text-[20px] font-extrabold text-[#da2966] leading-none">{isLoading ? '—' : totalCount}</span>
          <span className="text-[12px] font-medium text-gray-400">{currentTab.label.toLowerCase()}</span>
        </div>
        {search && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fff0f3] border border-[#fdd8e4]">
            <span className="text-[12px] font-semibold text-[#da2966]">{currentCount} résultat{currentCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="px-0 md:px-6 lg:px-8">
        <div className="bg-white rounded-t-[24px] md:rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-4 py-3.5 md:px-6 flex items-center gap-3 border-b border-gray-100">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={`Rechercher…`}
                className="w-full h-10 pl-8 pr-3 rounded-xl bg-[#f8f8f8] text-[13px] font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#da2966]/30"
              />
            </div>
            {search && (
              <button onClick={() => setSearch('')} className="text-[12px] text-gray-400 hover:text-[#da2966] font-medium transition-colors shrink-0">
                Effacer
              </button>
            )}
          </div>

          {activeTab === 'categories' && (
            <DataTable<AdminCategory> data={filteredCategories} columns={categoryColumns} isLoading={loadingCats} emptyMessage={currentTab.emptyMsg}
              renderMobileCard={(cat) => (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#222] truncate">{cat.name}</p>
                    {cat.products_count !== undefined && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{cat.products_count} produit{cat.products_count !== 1 ? 's' : ''}</p>}
                  </div>
                  <RowActions onEdit={() => { setEditingCategory(cat); setShowModal(true); }} onDelete={() => setDeleteTarget({ id: cat.id, name: cat.name, type: 'categories' })} />
                </div>
              )} />
          )}

          {activeTab === 'brands' && (
            <DataTable<AdminBrand> data={filteredBrands} columns={brandColumns} isLoading={loadingBrands} emptyMessage={currentTab.emptyMsg}
              renderMobileCard={(brand) => (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#222] truncate">{brand.name}</p>
                    {brand.products_count !== undefined && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{brand.products_count} produit{brand.products_count !== 1 ? 's' : ''}</p>}
                  </div>
                  <RowActions onEdit={() => { setEditingBrand(brand); setShowModal(true); }} onDelete={() => setDeleteTarget({ id: brand.id, name: brand.name, type: 'brands' })} />
                </div>
              )} />
          )}

          {activeTab === 'ingredients' && (
            <DataTable<AdminIngredient> data={filteredIngredients} columns={ingredientColumns} isLoading={loadingIng} emptyMessage={currentTab.emptyMsg}
              renderMobileCard={(ing) => (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#222] truncate">{ing.name}</p>
                    {ing.products_count !== undefined && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{ing.products_count} produit{ing.products_count !== 1 ? 's' : ''}</p>}
                  </div>
                  <RowActions onEdit={() => { setEditingIngredient(ing); setShowModal(true); }} onDelete={() => setDeleteTarget({ id: ing.id, name: ing.name, type: 'ingredients' })} />
                </div>
              )} />
          )}
        </div>
      </div>

      {/* Modals */}
      <CategoryModal isOpen={showModal && activeTab === 'categories'} onClose={closeModal} onSaved={() => { closeModal(); refetchCats(); }} editing={editingCategory} categories={categories} />
      <BrandModal isOpen={showModal && activeTab === 'brands'} onClose={closeModal} onSaved={() => { closeModal(); refetchBrands(); }} editing={editingBrand} />
      <IngredientModal isOpen={showModal && activeTab === 'ingredients'} onClose={closeModal} onSaved={() => { closeModal(); refetchIng(); }} editing={editingIngredient} />

      {deleteTarget && (
        <DeleteConfirmModal
          title={`Supprimer "${deleteTarget.name}" ?`}
          description="Cette action est irréversible. L'élément sera définitivement supprimé."
          onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)}
          deleting={deleting} confirmLabel="Supprimer" cancelLabel="Annuler"
        />
      )}
    </div>
  );
}
