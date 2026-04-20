'use client';

import { useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function DeleteConfirmModal({
  title,
  description,
  onConfirm,
  onCancel,
  deleting,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
}: DeleteConfirmModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-7 pb-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#fdf0f4] flex items-center justify-center mb-5">
            <Trash2 size={24} className="text-[#da2966]" strokeWidth={1.8} />
          </div>
          <h3 className="text-[17px] font-bold text-[#111] text-center mb-2">
            {title}
          </h3>
          <p className="text-[13px] text-gray-500 text-center leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-4 text-[14px] font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <div className="w-px bg-gray-100" />
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-4 text-[14px] font-semibold text-white bg-[#da2966] hover:bg-[#c01f54] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <><Loader2 size={16} className="animate-spin" />{confirmLabel}…</>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
