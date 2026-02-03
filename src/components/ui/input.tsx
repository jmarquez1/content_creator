'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm transition-all placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[var(--color-destructive)] focus:ring-[var(--color-destructive)]',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[var(--color-destructive)]">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
