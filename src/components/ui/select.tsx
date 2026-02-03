'use client';

import { forwardRef, type SelectHTMLAttributes, type ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          className={cn(
            'flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--color-destructive)] focus:ring-[var(--color-destructive)]',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-[var(--color-destructive)]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Custom Select Components for more complex use cases

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface SelectRootProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function SelectRoot({ children, value: controlledValue, defaultValue = '', onValueChange }: SelectRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const value = controlledValue ?? internalValue;
  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <div className="relative w-full" data-state={open ? 'open' : 'closed'}>
      {typeof children === 'function'
        ? (children as (ctx: SelectContextValue) => ReactNode)({ value, onValueChange: handleValueChange, open, setOpen })
        : children}
    </div>
  );
}

interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

function SelectTrigger({ children, className, onClick }: SelectTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

function SelectContent({ children, className }: SelectContentProps) {
  return (
    <div
      className={cn(
        'absolute z-50 mt-1 w-full rounded-xl border border-[var(--color-border)] bg-white shadow-lg animate-scale-in',
        className
      )}
    >
      <div className="p-1 max-h-60 overflow-auto">{children}</div>
    </div>
  );
}

interface SelectItemProps {
  children: ReactNode;
  value: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

function SelectItem({ children, value, className, onClick, selected }: SelectItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors',
        selected
          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
          : 'hover:bg-[var(--color-secondary)]',
        className
      )}
      data-value={value}
    >
      {children}
      {selected && <Check className="h-4 w-4" />}
    </div>
  );
}

interface SelectValueProps {
  placeholder?: string;
  children?: ReactNode;
}

function SelectValue({ placeholder, children }: SelectValueProps) {
  return (
    <span className={cn(!children && 'text-[var(--color-muted-foreground)]')}>
      {children || placeholder || 'Select...'}
    </span>
  );
}

export {
  Select,
  SelectRoot as SelectProvider,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
};
