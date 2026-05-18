'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from '@/components/ui/Icon';
import { DIFFICULTY_CONFIG, type Difficulty } from '@/lib/typemaster/xp-system';

interface Props {
  difficulty: Difficulty;
  index?: number;
}

const ICON: Record<Difficulty, string> = {
  beginner: '🌱',
  advanced: '⚔️',
  pro: '🔥',
};

export function ModeCard({ difficulty, index = 0 }: Props) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        href={`/typemaster/play?difficulty=${difficulty}`}
        className="group relative block rounded-2xl overflow-hidden border border-white/[0.06] glass card-hover p-6 h-full"
      >
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"
          style={{ background: cfg.color }}
        />
        <div className="relative space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-4xl">{ICON[difficulty]}</div>
            <div
              className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md"
              style={{
                background: `${cfg.color}20`,
                color: cfg.color,
              }}
            >
              {cfg.timerSec ? `${cfg.timerSec}s` : 'Sin timer'}
            </div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold">{cfg.label}</div>
            <p className="text-sm text-ink-dim mt-1.5 leading-relaxed">
              {cfg.description}
            </p>
          </div>
          <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-ink-dim">
              <span>+{cfg.xpBase} XP base</span>
              {cfg.duals && <span>· Dual types</span>}
              {cfg.immunities && <span>· Inmunidades</span>}
            </div>
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              style={{ color: cfg.color }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
