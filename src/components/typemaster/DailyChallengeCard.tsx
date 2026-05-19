'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ArrowRight, SparklesIcon, CheckIcon } from '@/components/ui/Icon';
import { useTypeMasterStore, getTodayISO } from '@/stores/typemasterStore';

function msUntilTomorrow() {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return tomorrow.getTime() - now.getTime();
}

function format(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function DailyChallengeCard() {
  const last = useTypeMasterStore((s) => s.lastDailyChallengeISODate);
  const totalDaily = useTypeMasterStore((s) => s.dailyChallengeCount);
  const today = getTodayISO();
  const available = last !== today;

  const [now, setNow] = useState(0);
  useEffect(() => {
    if (available) return;
    setNow(msUntilTomorrow());
    const id = setInterval(() => setNow((n) => Math.max(0, n - 1000)), 1000);
    return () => clearInterval(id);
  }, [available, last]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-accent-yellow/30 p-5 sm:p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/15 via-orange-500/10 to-accent-red/5 pointer-events-none" />
      <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-accent-yellow/20 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent-yellow font-bold mb-2">
            <SparklesIcon className="w-3.5 h-3.5" />
            Daily Challenge
            {available ? (
              <span className="text-[10px] font-bold tracking-widest text-accent-green ml-1">
                · DISPONIBLE
              </span>
            ) : (
              <span className="text-[10px] font-bold tracking-widest text-ink-faint ml-1">
                · COMPLETADO HOY
              </span>
            )}
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold">
            15 preguntas · ×1,5 XP · 8s por turno
          </h3>
          <p className="text-ink-soft mt-1.5 text-sm leading-relaxed max-w-xl">
            Un único reto diario que mezcla todo: super-eficaz, resistencias,
            inmunidades, dual types y multiplicadores. Solo uno al día.
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <div className="text-ink-faint">
              Completados:{' '}
              <span className="font-bold text-ink tabular-nums">
                {totalDaily}
              </span>
            </div>
            {!available && now > 0 && (
              <div className="text-ink-faint">
                Próximo en{' '}
                <span className="font-mono font-bold text-ink tabular-nums">
                  {format(now)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0">
          {available ? (
            <Link
              href="/typemaster/play?daily=1"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-accent-yellow to-orange-500 text-bg-950 font-bold text-sm shadow-[0_0_30px_-5px_rgba(250,204,21,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Empezar reto
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-accent-green/15 text-accent-green font-bold text-sm border border-accent-green/30">
              <CheckIcon className="w-4 h-4" />
              Hecho
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
