'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ── Icons ─────────────────────────────────────────────────────────────────────
const LeafIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 22V12M12 12C12 12 7 10 5 6c2 0 5 1 7 6zM12 12c0 0 5-2 7-6-2 0-5 1-7 6z" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface IngredientOption {
  id: number;
  name: string;
  image_url: string | null;
}

interface IngredientSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableIngredients: IngredientOption[];
  /** Pre-select an ingredient by id string when opening in edit mode */
  initialSelectedId?: string;
  isEditing?: boolean;
  onConfirm: (ingredient: IngredientOption) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function IngredientSelectModal({
  isOpen,
  onClose,
  availableIngredients,
  initialSelectedId = '',
  isEditing = false,
  onConfirm,
}: IngredientSelectModalProps) {
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (isOpen) setSelectedId(initialSelectedId);
  }, [isOpen, initialSelectedId]);

  if (!isOpen) return null;

  const found = availableIngredients.find(i => String(i.id) === selectedId);

  const handleConfirm = () => {
    if (!found) return;
    onConfirm(found);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-6 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >✕</button>

        <h3 className="text-[18px] font-bold text-[#da2966] mb-6 flex items-center justify-center gap-2">
          <LeafIcon />
          {isEditing ? 'Edit Ingredient' : 'Select Ingredient'}
        </h3>

        {/* Dropdown */}
        <div className="relative mb-5">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full h-12 px-4 pr-10 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40 appearance-none cursor-pointer"
          >
            <option value="">— Choose an ingredient —</option>
            {availableIngredients.map(ing => (
              <option key={ing.id} value={String(ing.id)}>{ing.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronDown />
          </div>
        </div>

        {/* Preview card */}
        <div className={`w-full h-[72px] rounded-2xl flex items-center gap-4 px-4 mb-6 transition-colors ${found ? 'bg-[#fff0f3] border border-[#f7c5d2]' : 'bg-[#f8f8f8] border border-transparent'}`}>
          <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center">
            {found?.image_url
              ? <img src={found.image_url} alt={found.name} className="w-full h-full object-cover" />
              : <span className="text-gray-300"><LeafIcon /></span>
            }
          </div>
          <span className={`text-[14px] font-semibold truncate ${found ? 'text-[#da2966]' : 'text-gray-300'}`}>
            {found ? found.name : 'No ingredient selected'}
          </span>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          className={`w-full h-12 rounded-xl text-white font-bold text-[14px] transition-colors flex items-center justify-center gap-2 ${!selectedId ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#da2966] hover:bg-[#c22158]'}`}
        >
          + {isEditing ? 'Update Ingredient' : 'Add Ingredient'}
        </button>
      </div>
    </div>,
    document.body
  );
}
