'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Leaf, Upload } from 'lucide-react';
import { adminIngredientService, AdminIngredient } from '@/services/api';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: AdminIngredient | null;
}

export default function IngredientModal({ isOpen, onClose, onSaved, editing }: IngredientModalProps) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(editing?.name ?? '');
      setFile(null);
      setFilePreview(null);
      setError(null);
      setNameError(false);
    }
  }, [editing, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!name.trim()) { setNameError(true); setError('Le nom est obligatoire.'); return; }
    setIsSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (file) formData.append('image', file);

      if (editing) {
        await adminIngredientService.update(editing.id, formData);
      } else {
        await adminIngredientService.create(formData);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors as Record<string, string[]>)[0]?.[0];
        setError(first ?? 'Le formulaire contient des erreurs.');
      } else {
        setError(err.response?.data?.message ?? err.message ?? 'Une erreur est survenue.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentImage = filePreview ?? editing?.image_url ?? null;

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
          <Leaf size={20} strokeWidth={1.8} />
          {editing ? "Modifier l'ingrédient" : 'Ajouter un ingrédient'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-semibold text-[#333] block mb-1.5">
              Image <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-[#da2966]/25 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#fff8fa] hover:border-[#da2966]/50 transition-colors gap-2"
            >
              {currentImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-gray-100" />
                  <p className="text-[12px] text-gray-400 font-medium">{file ? file.name : 'Cliquer pour changer'}</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-[#fff0f3] flex items-center justify-center">
                    <Upload size={20} className="text-[#da2966]" />
                  </div>
                  <p className="text-[13px] text-gray-400 font-medium">Cliquer pour uploader</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-[#333] block mb-1.5">
              Nom <span className="text-[#da2966]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="ex: Acide hyaluronique"
              autoFocus
              className={`w-full h-12 px-4 rounded-xl text-[14px] font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                nameError ? 'bg-red-50 ring-1 ring-red-400' : 'bg-[#f8f8f8] focus:ring-[#da2966]/40'
              }`}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-[13px] font-medium mt-4 text-center">{error}</p>}

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
