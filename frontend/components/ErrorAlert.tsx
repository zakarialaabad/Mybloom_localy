'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
  title?: string;
}

export const ErrorAlert = ({
  message,
  onClose,
  dismissible = true,
  title = 'Error',
}: ErrorAlertProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <AlertCircle size={14} className="text-red-600" strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        {title && <h3 className="text-sm font-semibold text-red-900 mb-1">{title}</h3>}
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
