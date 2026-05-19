'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useTypeMasterStore } from '@/stores/typemasterStore';
import {
  TrophyIcon,
  FlameIcon,
  BoltIcon,
  ClockIcon,
  ArrowRight,
} from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { levelFromXP, rankFromLevel } from '@/lib/typemaster/xp-system';

// Seeded mock leaderboard so the page is never empty.
// User's own stats will be injected at runtime.
interface Entry {
  name: string;
  flag: string;
  xp: number;
  bestCombo: number;
  fastestMs: number;
  weeklyXP: number;
}

const SEED: Entry[] = [
  { name: 'Lance·Champion',  flag: '🟦', xp: 18420, bestCombo: 87, fastestMs: 870, weeklyXP: 3120 },
  { name: 'Cynthia',          flag: '🟪', xp: 16550, bestCombo: 74, fastestMs: 940, weeklyXP: 2810 },
  { name: 'BugCatcher_Marc',  flag: '🟩', xp: 14210, bestCombo: 52, fastestMs: 1180, weeklyXP: 2640 },
  { name: 'iceQueen',         flag: '🟦', xp: 13800, bestCombo: 61, fastestMs: 1050, weeklyXP: 1920 },
  { name: 'ProfOak',          flag: '🟨', xp: 11240, bestCombo: 44, fastestMs: 1320, weeklyXP: 1480 },
  { name: 'Ash·Champion',     flag: '🟥', xp: 10870, bestCombo: 55, fastestMs: 1190, weeklyXP: 1200 },
  { name: 'PalkiaFan',        flag: '🟪', xp: 9500,  bestCombo: 38, fastestMs: 1410, weeklyXP: 980 },
  { name: 'Misty99',          flag: '🟦', xp: 8120,  bestCombo: 33, fastestMs: 1550, weeklyXP: 760 },
  { name: 'GreninjaMain',     flag: '🟦', xp: 7400,  bestCombo: 41, fastestMs: 1280, weeklyXP: 640 },
  { name: 'PoisonPunkPro',    flag: '🟪', xp: 5980,  bestCombo: 28, fastestMs: 1620, weeklyXP: 410 },
];

function withUser(entries: Entry[], user: Entry): Entry[] {
  const others = entries.filter((e) => e.name !== 'You');
  return [...others, user];
}

export default function LeaderboardPage() {
  const xp = useTypeMasterStore((s) => s.xp);
  const bestCombo = useTypeMasterStore((s) => s.bestComboAllTime);
  const history = useTypeMasterStore((s) => s.history);

  const weeklyXP = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    return history
      .filter((r) => r.date >= cutoff)
      .reduce((acc, r) => acc + r.xpGained, 0);
  }, [history]);

  const fastestMs = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.min(...history.map((r) => r.avgResponseMs));
  }, [history]);

  const userEntry: Entry = {
    name: 'You',
    flag: '🔵',
    xp,
    bestCombo,
    fastestMs: fastestMs || 9999,
    weeklyXP,
  };

  const all = withUser(SEED, userEntry);

  const byXP = [...all].sort((a, b) => b.xp - a.xp);
  const byCombo = [...all].sort((a, b) => b.bestCombo - a.bestCombo);
  const bySpeed = [...all]
    .filter((e) => e.fastestMs > 0 && e.fastestMs < 9999)
    .sort((a, b) => a.fastestMs - b.fastestMs);
  const byWeek = [...all].sort((a, b) => b.weeklyXP - a.weeklyXP);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-accent-yellow font-semibold mb-2">
            TypeMaster · Leaderboard
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Compite por la <span className="gradient-text">cima</span>
          </h1>
          <p className="text-ink-dim mt-2 max-w-xl text-sm">
            Rankings locales con datos semilla — el leaderboard global se
            activa cuando conectes Supabase.
          </p>
        </div>
        <Link href="/typemaster/play?difficulty=pro">
          <Button variant="gradient" size="md">
            Pro Mode
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="xp">
        <TabsList className="flex-wrap">
          <TabsTrigger value="xp">
            <span className="flex items-center gap-1.5">
              <TrophyIcon className="w-3.5 h-3.5" />
              Global
            </span>
          </TabsTrigger>
          <TabsTrigger value="week">
            <span className="flex items-center gap-1.5">
              <BoltIcon className="w-3.5 h-3.5" />
              Semanal
            </span>
          </TabsTrigger>
          <TabsTrigger value="combo">
            <span className="flex items-center gap-1.5">
              <FlameIcon className="w-3.5 h-3.5" />
              Combos
            </span>
          </TabsTrigger>
          <TabsTrigger value="speed">
            <span className="flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5" />
              Velocidad
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="xp" className="mt-5">
          <Table
            entries={byXP}
            metric={(e) => `${e.xp.toLocaleString()} XP`}
            extra={(e) => `${rankFromLevel(levelFromXP(e.xp)).name}`}
          />
        </TabsContent>
        <TabsContent value="week" className="mt-5">
          <Table
            entries={byWeek}
            metric={(e) => `${e.weeklyXP.toLocaleString()} XP`}
            extra={() => 'Últimos 7 días'}
          />
        </TabsContent>
        <TabsContent value="combo" className="mt-5">
          <Table
            entries={byCombo}
            metric={(e) => `×${e.bestCombo}`}
            extra={() => 'Mejor combo'}
          />
        </TabsContent>
        <TabsContent value="speed" className="mt-5">
          <Table
            entries={bySpeed}
            metric={(e) => `${(e.fastestMs / 1000).toFixed(2)}s`}
            extra={() => 'Promedio respuesta'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Table({
  entries,
  metric,
  extra,
}: {
  entries: Entry[];
  metric: (e: Entry) => string;
  extra: (e: Entry) => string;
}) {
  return (
    <div className="card-base p-3 sm:p-4">
      <div className="space-y-1.5">
        {entries.map((e, i) => {
          const isUser = e.name === 'You';
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
          return (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isUser
                  ? 'bg-brand/15 border border-brand/30'
                  : i < 3
                  ? 'glass-strong'
                  : 'glass'
              }`}
            >
              <div className="w-7 text-center font-mono font-bold text-ink-faint shrink-0">
                {medal ?? String(i + 1).padStart(2, '0')}
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                {e.flag}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate flex items-center gap-2">
                  {e.name === 'You' ? 'Tú' : e.name}
                  {isUser && (
                    <span className="text-[9px] font-bold tracking-widest uppercase text-brand-glow">
                      Tú
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-faint truncate">
                  {extra(e)}
                </div>
              </div>
              <div className="font-display font-bold text-ink shrink-0">
                {metric(e)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
