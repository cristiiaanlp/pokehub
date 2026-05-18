'use client';

import { motion } from 'framer-motion';
import { BADGES } from '@/lib/typemaster/achievements';
import { useTypeMasterStore } from '@/stores/typemasterStore';

const RARITY: Record<string, string> = {
  common: 'from-slate-500/30 to-slate-600/10 border-slate-400/20',
  rare: 'from-blue-500/30 to-blue-700/10 border-blue-400/30',
  epic: 'from-fuchsia-500/30 to-purple-700/10 border-fuchsia-400/30',
  legendary: 'from-amber-400/30 to-orange-600/10 border-amber-400/40',
};

export function BadgeGrid() {
  const earned = useTypeMasterStore((s) => s.earnedBadges);
  const all = Object.values(BADGES);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {all.map((b, i) => {
        const has = earned.includes(b.id);
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`relative p-4 rounded-2xl border bg-gradient-to-br ${
              RARITY[b.rarity]
            } ${has ? '' : 'grayscale opacity-40'}`}
            title={b.description}
          >
            <div className="text-3xl text-center mb-1.5">{b.emoji}</div>
            <div className="text-xs font-bold text-center truncate">
              {b.name}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-ink-faint text-center mt-0.5">
              {b.rarity}
            </div>
            {has && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center ring-2 ring-bg-900">
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
