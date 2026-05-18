'use client';

import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { rankFromLevel } from '@/lib/typemaster/xp-system';
import { TrophyIcon } from '@/components/ui/Icon';

interface Props {
  level: number | null;
  onDone: () => void;
}

export function LevelUpOverlay({ level, onDone }: Props) {
  useEffect(() => {
    if (level === null) return;
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [level, onDone]);

  // re-randomize confetti each time `level` changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const confetti = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const colors = ['#3B82F6', '#FACC15', '#EF4444', '#10B981', '#8B5CF6'];
      return {
        x: (Math.random() - 0.5) * 600,
        y: -50 - Math.random() * 200,
        endY: 600 + Math.random() * 200,
        color: colors[i % colors.length],
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.3,
        size: 6 + Math.random() * 6,
      };
    });
  }, [level]);

  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-950/70 backdrop-blur-md"
        >
          {confetti.map((p, i) => {
            return (
              <motion.div
                key={i}
                initial={{ x: p.x, y: p.y, rotate: 0, opacity: 1 }}
                animate={{
                  x: p.x + (Math.random() - 0.5) * 200,
                  y: p.endY,
                  rotate: p.rotate,
                  opacity: 0,
                }}
                transition={{
                  duration: 1.6,
                  delay: p.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute rounded-sm"
                style={{
                  width: p.size,
                  height: p.size * 0.5,
                  background: p.color,
                }}
              />
            );
          })}

          <motion.div
            initial={{ scale: 0.7, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.45, duration: 0.7 }}
            className="relative z-10 text-center px-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl bg-gradient-to-br from-brand to-brand-glow shadow-glow-strong">
              <TrophyIcon className="w-10 h-10 text-white" />
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-accent-yellow font-bold mb-1">
              Subiste de nivel
            </div>
            <div className="font-display text-5xl sm:text-6xl font-bold">
              Nivel{' '}
              <span className="gradient-text">{level}</span>
            </div>
            <div
              className={`text-base font-bold mt-2`}
              style={{ color: rankFromLevel(level).color }}
            >
              {rankFromLevel(level).name}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
