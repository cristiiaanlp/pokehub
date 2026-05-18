'use client';

import { motion } from 'framer-motion';
import { useTypeMasterStore } from '@/stores/typemasterStore';
import { xpProgress, rankFromLevel } from '@/lib/typemaster/xp-system';

export function XPBar({ compact = false }: { compact?: boolean }) {
  const xp = useTypeMasterStore((s) => s.xp);
  const { level, current, needed, pct } = xpProgress(xp);
  const rank = rankFromLevel(level);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div
          className={`relative h-10 w-10 rounded-xl bg-gradient-to-br ${rank.gradient} flex items-center justify-center font-display font-bold text-white shadow-glow shrink-0`}
        >
          {level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold tracking-wide uppercase truncate" style={{ color: rank.color }}>
            {rank.name}
          </div>
          <div className="mt-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${rank.gradient}`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-4">
        <div
          className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${rank.gradient} flex items-center justify-center font-display font-bold text-2xl text-white shadow-glow shrink-0`}
        >
          {level}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-yellow text-bg-950 text-[9px] font-bold flex items-center justify-center ring-2 ring-bg-900">
            LV
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.25em] text-ink-faint font-semibold">
            Rango
          </div>
          <div
            className="font-display font-bold text-lg truncate"
            style={{ color: rank.color }}
          >
            {rank.name}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full bg-gradient-to-r ${rank.gradient} shadow-[0_0_12px_rgba(59,130,246,0.4)]`}
              />
            </div>
            <div className="text-xs font-mono text-ink-dim shrink-0">
              {current}/{needed} XP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
