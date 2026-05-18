'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-brand hover:bg-brand-hover text-white shadow-glow active:scale-[0.98]',
  secondary:
    'glass-strong hover:bg-white/[0.10] text-ink active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-white/[0.06] text-ink-soft hover:text-ink active:scale-[0.98]',
  danger:
    'bg-accent-red hover:bg-red-600 text-white shadow-[0_0_30px_-10px_rgba(239,68,68,0.6)] active:scale-[0.98]',
  gradient:
    'bg-gradient-to-r from-brand via-brand-glow to-accent-yellow text-bg-950 font-bold active:scale-[0.98] shadow-glow-strong',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-2',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-14 px-7 text-base rounded-2xl gap-3',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', loading, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
});
