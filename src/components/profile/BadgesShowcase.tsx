'use client';

import { BADGES, type BadgeMeta } from '@/lib/badges';
import { TrophyIcon } from '@/components/ui/Icon';

interface Props {
  /** Array de badge IDs earned por el usuario */
  earned: string[];
}

export function BadgesShowcase({ earned }: Props) {
  const earnedSet = new Set(earned);
  const allBadges = Object.values(BADGES);
  const earnedCount = allBadges.filter((b) => earnedSet.has(b.id)).length;
  const totalCount = allBadges.length;
  const pct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-accent-yellow" />
          Mis logros
        </h2>
        <div className="text-xs text-ink-faint">
          <span className="font-bold text-ink">{earnedCount}</span>/{totalCount} desbloqueados
          <span className="ml-2 text-ink-faint">({pct}%)</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-yellow to-brand-glow transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Grid de badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {allBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} earned={earnedSet.has(badge.id)} />
        ))}
      </div>

      <p className="text-[11px] text-ink-faint text-center">
        Los logros se actualizan automáticamente cuando completas las acciones
        correspondientes.
      </p>
    </section>
  );
}

function BadgeCard({ badge, earned }: { badge: BadgeMeta; earned: boolean }) {
  return (
    <div
      className={`card-base p-3 text-center transition-all border ${
        earned
          ? `${badge.tone} ring-1`
          : 'opacity-40 grayscale border-white/[0.04] hover:opacity-60'
      }`}
      title={badge.description}
    >
      <div className="text-3xl mb-1">{badge.emoji}</div>
      <div className="font-display font-bold text-xs leading-tight">
        {badge.name}
      </div>
      <div className="text-[10px] text-ink-faint mt-1 leading-tight">
        {badge.description}
      </div>
    </div>
  );
}
