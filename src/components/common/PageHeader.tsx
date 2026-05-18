import type { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  subtitle,
  right,
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-10">
      <div>
        {kicker && (
          <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
            {kicker}
          </div>
        )}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-ink-dim mt-3 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}
