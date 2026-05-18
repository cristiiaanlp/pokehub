'use client';

import { motion } from 'framer-motion';
import { cn, statColor } from '@/lib/utils';

interface Props {
  label: string;
  value: number;
  max?: number;
  className?: string;
}

export function StatBar({ label, value, max = 255, className }: Props) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn('flex items-center gap-3 text-sm', className)}>
      <div className="w-24 shrink-0 text-ink-dim font-medium">{label}</div>
      <div className="w-10 shrink-0 text-right font-mono text-ink font-semibold">
        {value}
      </div>
      <div className="flex-1 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            statColor(value)
          )}
        />
      </div>
    </div>
  );
}
