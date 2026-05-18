'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, leftIcon, rightSlot, ...rest },
  ref
) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 h-11 px-3.5 rounded-xl glass focus-within:border-brand/40 focus-within:bg-white/[0.06] transition-colors',
        className
      )}
    >
      {leftIcon && (
        <span className="text-ink-dim group-focus-within:text-ink-soft transition-colors">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className="bg-transparent outline-none flex-1 text-ink placeholder:text-ink-faint text-sm"
        {...rest}
      />
      {rightSlot}
    </div>
  );
});
