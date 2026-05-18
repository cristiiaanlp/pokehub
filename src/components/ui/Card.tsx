import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable, children, ...rest }: CardProps) {
  return (
    <div
      className={cn('card-base p-5', hoverable && 'card-hover', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
