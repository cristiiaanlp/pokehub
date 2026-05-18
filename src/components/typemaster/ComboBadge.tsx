'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FlameIcon } from '@/components/ui/Icon';
import { comboMultiplier } from '@/lib/typemaster/xp-system';

export function ComboBadge({ combo }: { combo: number }) {
  const mult = comboMultiplier(combo);
  const showMult = combo >= 2;
  return (
    <div className="flex items-center gap-3">
      <AnimatePresence mode="popLayout">
        {combo > 0 ? (
          <motion.div
            key={combo}
            initial={{ scale: 0.6, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.45, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <FlameIcon
              className={`w-5 h-5 ${
                combo >= 10
                  ? 'text-accent-red'
                  : combo >= 5
                  ? 'text-accent-yellow'
                  : 'text-orange-400'
              }`}
            />
            <span
              className={`font-display font-bold tabular-nums ${
                combo >= 10 ? 'text-accent-red text-xl' : 'text-ink text-lg'
              }`}
            >
              ×{combo}
            </span>
            {showMult && (
              <span className="text-[10px] uppercase tracking-widest font-bold text-accent-yellow">
                {mult.toFixed(2)}× XP
              </span>
            )}
          </motion.div>
        ) : (
          <div className="text-xs text-ink-faint uppercase tracking-widest">
            Combo apagado
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
