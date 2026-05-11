'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Tag } from 'lucide-react';
import { AdminCategory, adminCategoryService } from '@/services/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: AdminCategory | null;
  categories: AdminCategory[];
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSaved,
  editing,
  categories,
}: CategoryModalProps) {
  const [nameValue, setNameValue] = useState('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [displayOrder, setDisplayOrder] = useState<number | ''>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNameValue(editing?.name ?? '');
      setParentId(editing?.parent_id ?? '');
      setDisplayOrder(editing?.display_order ?? 0);
      setError(null);
    }
  }, [editing, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!nameValue.trim()) { setError('Veuillez saisir un nom.'); return; }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: nameValue.trim(),
        parent_id: parentId !== '' ? Number(parentId) : null,
        sort_order: displayOrder !== '' ? Number(displayOrder) : 0,
      };
      if (editing) {
        await adminCategoryService.update(editing.id, payload);
      } else {
        await adminCategoryService.create(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Une erreur est survenue.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const rootCategories = categories.filter(
    (c) => c.parent_id === null && c.id !== editing?.id
  );

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>

        <h3 className="text-[18px] font-bold text-[#da2966] mb-6 flex items-center gap-2">
          <Tag size={20} strokeWidth={1.8} />
          {editing ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-semibold text-[#333] block mb-1.5">
              Nom <span className="text-[#da2966]">*</span>
            </label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="ex: Soins du visage"
              autoFocus
              className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] text-[14px] font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#da2966]/40"
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-[#333] block mb-1.5">
              Catégorie parente
            </label>
            <select
              value={parentId}
              onChange={(e) =>
                setParentId(e.target.value !== '' ? Number(e.target.value) : '')
              }
              className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] text-[14px] font-medium text-[#333] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40 appearance-none cursor-pointer"
            >
              <option value="">— Aucune (catégorie racine) —</option>
              {rootCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-[#333] block mb-1.5">
              Ordre d&apos;affichage
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) =>
                setDisplayOrder(e.target.value !== '' ? Number(e.target.value) : '')
              }
              placeholder="0"
              min="0"
              className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] text-[14px] font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#da2966]/40"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-[13px] font-medium mt-4 text-center">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-600 text-[14px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-12 rounded-xl bg-[#da2966] text-white font-bold text-[14px] hover:bg-[#c22158] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" />Enregistrement…</>
            ) : editing ? 'Modifier' : '+ Ajouter'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
