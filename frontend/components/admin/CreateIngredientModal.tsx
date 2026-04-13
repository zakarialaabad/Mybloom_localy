'use client';
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

// ── Icons ─────────────────────────────────────────────────────────────────────
const LeafIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 22V12M12 12C12 12 7 10 5 6c2 0 5 1 7 6zM12 12c0 0 5-2 7-6-2 0-5 1-7 6z" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CloudUploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M7 16V12M7 12L5 14M7 12L9 14" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 16.2C21.2 15.6 22 14.4 22 13c0-2-1.5-3.5-3.5-3.5h-.4C17.3 6.9 14.8 5 12 5c-3.3 0-6 2.7-6 6 0 .2 0 .4.1.6C4.4 11.9 3 13.3 3 15c0 1.6 1.3 3 3 3h13c1.7 0 3-1.3 3-3z" fill="#da2966" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface IngredientOption {
  id: number;
  name: string;
  image_url: string | null;
}

interface CreateIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the newly created ingredient after successful backend save */
  onCreated: (ingredient: IngredientOption) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CreateIngredientModal({ isOpen, onClose, onCreated }: CreateIngredientModalProps) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName('');
    setFile(null);
    setError(null);
    setIsSaving(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter an ingredient name.'); return; }
    setError(null);
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (file) formData.append('image', file);

      // Get token from cookie (same pattern as updateProfile)
      let authToken = '';
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
        if (match) authToken = decodeURIComponent(match[1]);
      }

      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const { data } = await axios.post(`${baseURL}/v1/admin/ingredients`, formData, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          // No Content-Type — browser/XHR sets multipart/form-data with boundary automatically
        },
      });

      onCreated(data.data as IngredientOption);
      reset();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message ?? err.message ?? 'Something went wrong.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-8 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-6 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >✕</button>

        <h3 className="text-[18px] font-bold text-[#da2966] mb-8 flex items-center justify-center gap-2">
          <LeafIcon /> Add Ingredient
        </h3>

        {/* Image upload */}
        <div className="mb-8">
          <label className="text-[14px] font-bold text-[#333] block mb-4">Ingredient Image</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-12 border-2 border-dashed border-[#da2966] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#fff0f3] transition-colors gap-3"
          >
            {file ? (
              <><CloudUploadIcon /><span className="text-[13px] text-[#333] font-bold">{file.name}</span></>
            ) : (
              <><CloudUploadIcon /><p className="text-[14px] text-[#333] font-medium">Drag & drop or click to upload</p></>
            )}
          </div>
        </div>

        {/* Name input */}
        <div className="mb-8">
          <label className="text-[14px] font-bold text-[#333] block mb-3">Ingredient Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g Hyaluronic Acid"
            className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#da2966]/40"
          />
        </div>

        {error && <p className="text-red-500 text-[13px] font-medium mb-4 text-center">{error}</p>}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 rounded-xl bg-[#da2966] text-white font-bold text-[14px] hover:bg-[#c22158] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving…' : '+ Add Ingredient'}
        </button>
      </div>
    </div>,
    document.body
  );
}
