'use client';

import { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
}

export default function Tooltip({ text, children, position = 'top', align = 'center' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = position === 'top' 
    ? 'bottom-full mb-2' 
    : 'top-full mt-2';

  const alignClasses = 
    align === 'left' ? 'left-0' :
    align === 'right' ? 'right-0' :
    'left-1/2 -translate-x-1/2';

  const arrowClasses = 
    align === 'left' ? 'left-3' :
    align === 'right' ? 'right-3' :
    'left-1/2 -translate-x-1/2';

  const animationName = `tooltipIn_${align}`;

  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={`
            absolute ${alignClasses} ${positionClasses}
            px-3 py-1.5 bg-gray-900 text-white text-xs font-medium 
            rounded-md whitespace-nowrap shadow-lg z-50
            opacity-0 scale-95 transition-all duration-200
          `}
          style={{
            animation: `${animationName} 0.2s ease-out forwards`
          }}
        >
          {text}
          <div
            className={`
              absolute ${arrowClasses}
              ${position === 'top' ? '-bottom-1 border-t-8 border-t-gray-900' : '-top-1 border-b-8 border-b-gray-900'}
              border-l-4 border-r-4 border-l-transparent border-r-transparent
            `}
          />
        </div>
      )}
      <style>{`
        @keyframes tooltipIn_left {
          from {
            opacity: 0;
            transform: translateX(-8px) translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes tooltipIn_center {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes tooltipIn_right {
          from {
            opacity: 0;
            transform: translateX(8px) translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
