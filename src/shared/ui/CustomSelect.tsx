import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface CustomSelectOption<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badgeDotColor?: string;
  badgePulse?: boolean;
}

interface CustomSelectProps<T extends string | number> {
  id: string;
  value: T;
  options: CustomSelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  'aria-label'?: string;
}

export function CustomSelect<T extends string | number>({
  id,
  value,
  options,
  onChange,
  className,
  triggerClassName,
  menuClassName,
  'aria-label': ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = (currentIndex + delta + options.length) % options.length;
        onChange(options[nextIndex].value);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative inline-flex items-center text-xs', className)}>
      {/* Hidden native select for form sync, testing library and screen readers */}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as unknown as T)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled Dropdown Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-between gap-2 py-1.5 px-3 rounded-lg font-medium transition-all duration-150',
          'border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer',
          'hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : 'border-slate-200 dark:border-slate-700',
          triggerClassName
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.badgeDotColor && (
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                selectedOption.badgeDotColor,
                selectedOption.badgePulse && 'animate-pulse'
              )}
              aria-hidden="true"
            />
          )}
          {selectedOption?.icon && (
            <span className="text-slate-400 dark:text-slate-500 shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">{selectedOption?.label}</span>
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0',
            isOpen && 'transform rotate-180 text-blue-500'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Modern Floating Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            'absolute top-full left-0 mt-1.5 z-50 min-w-[140px] w-full rounded-xl p-1',
            'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            'shadow-dropdown focus:outline-none animate-in fade-in zoom-in-95 duration-100',
            menuClassName
          )}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors',
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/60'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.badgeDotColor && (
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        opt.badgeDotColor,
                        opt.badgePulse && 'animate-pulse'
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {opt.icon && (
                    <span className="text-slate-400 dark:text-slate-400 shrink-0">
                      {opt.icon}
                    </span>
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
