'use client';

/**
 * PriceHistogram — shared dual-handle range slider with histogram bars.
 *
 * Used in:
 *   – /collection sidebar filter
 *   – FilterModal (search-bar filter icon)
 *
 * Accepts globalMin/globalMax as bounds and calls onMinChange/onMaxChange
 * whenever the user drags a handle.  All pointer logic is self-contained.
 * activeThumb is UI-only state and intentionally kept local.
 */

import { useRef, useState } from 'react';

// Decorative bar heights (%) — scaled to a fixed shape matching the design
const BARS = [
  2, 2, 4, 8, 12, 18, 30, 22, 32, 25, 20, 38, 45, 28, 68, 58, 85, 80, 68, 62,
  45, 60, 88, 82, 70, 65, 58, 45, 35, 48, 28, 30, 8, 12, 6, 10, 5, 3, 2, 2,
];

interface PriceHistogramProps {
  globalMin: number;
  globalMax: number;
  selectedMin: number;
  selectedMax: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

export default function PriceHistogram({
  globalMin,
  globalMax,
  selectedMin,
  selectedMax,
  onMinChange,
  onMaxChange,
}: PriceHistogramProps) {
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const range     = Math.max(1, globalMax - globalMin);
  const leftPct   = ((selectedMin - globalMin) / range) * 100;
  const rightPct  = ((selectedMax - globalMin) / range) * 100;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect   = trackRef.current.getBoundingClientRect();
    const usable = rect.width - 18;
    const pct    = Math.min(1, Math.max(0, (e.clientX - rect.left - 9) / usable));
    const value  = globalMin + pct * range;

    const distMin = Math.abs(value - selectedMin);
    const distMax = Math.abs(value - selectedMax);
    const thumb: 'min' | 'max' = distMin <= distMax ? 'min' : 'max';
    setActiveThumb(thumb);

    if (thumb === 'min') onMinChange(Math.min(Math.round(value), selectedMax - 1));
    else                 onMaxChange(Math.max(Math.round(value), selectedMin + 1));

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeThumb || !trackRef.current) return;
    const rect   = trackRef.current.getBoundingClientRect();
    const usable = rect.width - 18;
    const pct    = Math.min(1, Math.max(0, (e.clientX - rect.left - 9) / usable));
    const value  = Math.round(globalMin + pct * range);
    if (activeThumb === 'min') onMinChange(Math.min(value, selectedMax - 1));
    else                       onMaxChange(Math.max(value, selectedMin + 1));
  };

  const handlePointerUp = () => setActiveThumb(null);

  return (
    <div>
      {/* ── Track + histogram ─────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        className="relative mx-3 mb-6 cursor-ew-resize select-none"
        style={{ paddingBottom: 9, overflow: 'visible' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Histogram bars */}
        <div className="flex items-end h-[100px] w-full gap-[2px]">
          {BARS.map((h, i) => {
            const bucketStart = globalMin + (i / BARS.length) * range;
            const bucketEnd   = globalMin + ((i + 1) / BARS.length) * range;
            const inSelection = selectedMin <= bucketEnd && selectedMax >= bucketStart;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${h}%`,
                  backgroundColor: inSelection ? '#da2966' : '#f4a0bc',
                  transition: 'background-color 0.15s ease',
                }}
              />
            );
          })}
        </div>

        {/* Baseline */}
        <div
          className="absolute left-0 right-0 h-[1px] bg-[#da2966]"
          style={{ bottom: 9 }}
        />

        {/* Active-range fill */}
        <div
          className="absolute h-[2px] bg-[#da2966] rounded-full"
          style={{
            bottom: 8,
            left:  `calc(${leftPct  / 100} * (100% - 18px))`,
            width: `calc(${(rightPct - leftPct) / 100} * (100% - 18px))`,
          }}
        />

        {/* Min handle */}
        <div
          className="absolute bg-white rounded-full"
          style={{
            bottom: 0,
            left:   `calc(${leftPct / 100} * (100% - 18px))`,
            width:  18,
            height: 18,
            border: activeThumb === 'min' ? '1.5px solid #da2966' : '1px solid #d4d4d4',
            boxShadow: '0 1px 4px rgba(0,0,0,0.13)',
            transition: 'border-color 0.15s ease',
          }}
        />

        {/* Max handle */}
        <div
          className="absolute bg-white rounded-full"
          style={{
            bottom: 0,
            left:   `calc(${rightPct / 100} * (100% - 18px))`,
            width:  18,
            height: 18,
            border: activeThumb === 'max' ? '1.5px solid #da2966' : '1px solid #d4d4d4',
            boxShadow: '0 1px 4px rgba(0,0,0,0.13)',
            transition: 'border-color 0.15s ease',
          }}
        />
      </div>

      {/* ── Min / Max value pills ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center">
          <div className="font-serif text-gray-500 mb-2 text-xs">Minimum</div>
          <div className="w-full h-[36px] flex items-center justify-center rounded-full bg-white border border-gray-100 text-xs font-medium text-gray-600 tabular-nums whitespace-nowrap overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            {selectedMin} MAD
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="font-serif text-gray-500 mb-2 text-xs">Maximum</div>
          <div className="w-full h-[36px] flex items-center justify-center rounded-full bg-white border border-gray-100 text-xs font-medium text-gray-600 tabular-nums whitespace-nowrap overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            {selectedMax} MAD
          </div>
        </div>
      </div>
    </div>
  );
}