'use client';

import React from 'react';

interface TableLoadingProps {
  columns?: number;
  rows?: number;
}

export const TableLoading = ({ columns = 8, rows = 5 }: TableLoadingProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-5">
              <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading = ({
  message = 'Loading...',
}: PageLoadingProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({
  icon,
  title,
  message,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-sm text-gray-500 mb-6 max-w-sm">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#da2966] text-white text-sm font-semibold rounded-lg hover:bg-[#b11b4e] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
