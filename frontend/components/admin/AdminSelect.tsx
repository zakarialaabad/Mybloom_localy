'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2.5 7l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Option extraction from <option> children ─────────────────────────────────
interface OptionItem { value: string; label: string; disabled?: boolean; }

function extractOptions(node: React.ReactNode): OptionItem[] {
  const result: OptionItem[] = [];
  const walk = (n: React.ReactNode) => {
    if (n == null || typeof n === 'boolean') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (!React.isValidElement(n)) return;
    const el = n as React.ReactElement<any>;
    if (el.type === 'option') {
      result.push({
        value:    String(el.props.value ?? ''),
        label:    String(el.props.children ?? ''),
        disabled: Boolean(el.props.disabled),
      });
    } else if (el.props?.children != null) {
      walk(el.props.children); // handle Fragment / arrays
    }
  };
  walk(node);
  return result;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AdminSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  variant?: 'form' | 'filter' | 'compact' | 'row';
  wrapperClassName?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

// ─── Per-variant trigger button styles ───────────────────────────────────────
const VARIANT_BTN: Record<NonNullable<AdminSelectProps['variant']>, string> = {
  form:    'h-12 px-4 pr-10 rounded-xl bg-[#f8f8f8] text-[14px] font-medium text-[#333]',
  filter:  'h-10 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-700',
  compact: 'px-4 pr-10 py-2.5 rounded-[8px] border border-gray-200 bg-white text-[13px] font-semibold text-[#444]',
  row:     'h-12 px-6 pr-10 rounded-xl text-[14px] font-bold text-[#333]',
};

// Open-state ring / border override per variant
const VARIANT_OPEN: Record<NonNullable<AdminSelectProps['variant']>, string> = {
  form:    'bg-white ring-1 ring-[#da2966]/40',
  filter:  '!border-[#da2966]/50 bg-[#fffbfc]',
  compact: '!border-[#da2966] ring-1 ring-[#da2966]/25',
  row:     '',
};

// ─── Component ────────────────────────────────────────────────────────────────
export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    { variant = 'form', wrapperClassName = '', className = '', error,
      disabled, children, value = '', name, onChange, ...props },
    ref,
  ) => {
    const [isOpen,     setIsOpen]     = useState(false);
    const [openUp,     setOpenUp]     = useState(false);
    const [focusedIdx, setFocusedIdx] = useState(0);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef    = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const options   = extractOptions(children);
    const strVal    = String(value);
    const selected  = options.find(o => o.value === strVal);
    const isEmpty   = !selected || selected.value === '';

    // ── Inject keyframe & scrollbar styles once ────────────────────────────────
    useEffect(() => {
      if (document.getElementById('__adm-sel-kf')) return;
      const s = document.createElement('style');
      s.id = '__adm-sel-kf';
      s.textContent = `
        @keyframes admSelIn  { from{opacity:0;transform:translateY(-6px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes admSelInUp{ from{opacity:0;transform:translateY(6px)  scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        
        /* Minimal elegant scrollbar for AdminSelect dropdown */
        [role="listbox"]::-webkit-scrollbar {
          width: 6px;
        }
        [role="listbox"]::-webkit-scrollbar-track {
          background: transparent;
        }
        [role="listbox"]::-webkit-scrollbar-thumb {
          background: #e5a8c4;
          border-radius: 3px;
          border: 2px solid white;
        }
        [role="listbox"]::-webkit-scrollbar-thumb:hover {
          background: #d98aaf;
        }
        /* Firefox */
        [role="listbox"] {
          scrollbar-width: thin;
          scrollbar-color: #e5a8c4 transparent;
        }
      `;
      document.head.appendChild(s);
    }, []);

    // ── Open / close ──────────────────────────────────────────────────────────
    const openDrop = useCallback(() => {
      if (disabled) return;
      if (wrapperRef.current) {
        const { bottom, top } = wrapperRef.current.getBoundingClientRect();
        setOpenUp(window.innerHeight - bottom < 260 && top > 260);
      }
      const idx = options.findIndex(o => o.value === strVal);
      setFocusedIdx(idx >= 0 ? idx : 0);
      setIsOpen(true);
    }, [disabled, options, strVal]);

    const closeDrop = useCallback(() => setIsOpen(false), []);

    const pickOption = useCallback((opt: OptionItem) => {
      if (opt.disabled) return;
      onChange?.({
        target:        { value: opt.value, name: name ?? '' },
        currentTarget: { value: opt.value, name: name ?? '' },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
      closeDrop();
      triggerRef.current?.focus();
    }, [name, onChange, closeDrop]);

    // ── Close on outside click ────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) closeDrop();
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, closeDrop]);

    // ── Scroll focused item into view ─────────────────────────────────────────
    useEffect(() => {
      if (!isOpen || !listRef.current) return;
      (listRef.current.children[focusedIdx] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, focusedIdx]);

    // ── Keyboard navigation ───────────────────────────────────────────────────
    const onKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) { openDrop(); return; }
        if (options[focusedIdx]) pickOption(options[focusedIdx]);
      } else if (e.key === 'Escape') {
        e.preventDefault(); closeDrop();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) { openDrop(); return; }
        setFocusedIdx(i => Math.min(i + 1, options.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) { openDrop(); return; }
        setFocusedIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Tab') {
        closeDrop();
      }
    };

    return (
      <div ref={wrapperRef} className={`relative ${wrapperClassName}`}>

        {/* ── Trigger button ── */}
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => isOpen ? closeDrop() : openDrop()}
          onKeyDown={onKeyDown}
          className={[
            'flex items-center w-full text-left border-0 focus:outline-none transition-all duration-150',
            VARIANT_BTN[variant],
            isOpen ? VARIANT_OPEN[variant] : '',
            error    ? 'ring-1 ring-red-400'          : '',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            className,
          ].filter(Boolean).join(' ')}
        >
          <span className={`truncate ${isEmpty ? 'text-gray-400' : ''}`}>
            {selected?.label ?? ''}
          </span>
        </button>

        {/* ── Animated chevron ── */}
        <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${isOpen ? 'rotate-180 text-[#da2966]' : 'text-gray-400'}`}>
          <ChevronDownIcon />
        </div>

        {/* ── Validation error ── */}
        {error && <span className="text-red-500 text-[12px] font-bold mt-1 block">{error}</span>}

        {/* ── Dropdown panel ── */}
        {isOpen && (
          <div
            ref={listRef}
            role="listbox"
            style={{ animation: `${openUp ? 'admSelInUp' : 'admSelIn'} 140ms cubic-bezier(0.16,1,0.3,1) both` }}
            className={[
              'absolute left-0 right-0 z-[500] overflow-y-auto',
              'bg-white rounded-[14px] py-1.5',
              'border border-[#f0dde5]',
              'shadow-[0_16px_48px_rgba(218,41,102,0.13),0_2px_12px_rgba(0,0,0,0.07)]',
              'max-h-[248px]',
              openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            ].join(' ')}
          >
            {options.map((opt, idx) => {
              const isSel      = opt.value === strVal;
              const isFoc      = idx === focusedIdx;
              const isEmptyOpt = opt.value === '';
              return (
                <div
                  key={`${idx}-${opt.value}`}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={opt.disabled}
                  onMouseEnter={() => !opt.disabled && setFocusedIdx(idx)}
                  onMouseDown={(e) => { e.preventDefault(); if (!opt.disabled) pickOption(opt); }}
                  className={[
                    'flex items-center justify-between mx-1.5 px-3.5 py-2.5 rounded-[10px]',
                    'text-[13.5px] leading-tight cursor-pointer select-none transition-colors duration-75',
                    isEmptyOpt ? 'text-gray-400 italic text-[13px]' : '',
                    !isEmptyOpt && isSel
                      ? 'bg-[#fff0f3] text-[#da2966] font-semibold'
                      : !isEmptyOpt && isFoc && !opt.disabled
                        ? 'bg-[#fdf4f6] text-[#da2966]'
                        : !isEmptyOpt
                          ? 'text-[#333] hover:bg-[#fdf4f6] hover:text-[#da2966]'
                          : '',
                    opt.disabled ? 'opacity-40 pointer-events-none' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span>{opt.label}</span>
                  {isSel && !isEmptyOpt && (
                    <span className="ml-2 shrink-0 text-[#da2966]"><CheckIcon /></span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Hidden native select — form submit compat ── */}
        <select
          ref={ref}
          name={name}
          value={value}
          tabIndex={-1}
          onChange={() => {}}
          className="sr-only"
          aria-hidden="true"
        >
          {children}
        </select>

      </div>
    );
  },
);

AdminSelect.displayName = 'AdminSelect';
