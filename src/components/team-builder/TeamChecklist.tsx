'use client';

import { useMemo } from 'react';
import { useTeamStore } from '@/stores/teamStore';
import { analyzeChecklist } from '@/lib/team-analysis/checklist';
import { artworkFor } from '@/lib/pokeapi';
import { CheckIcon, XIcon } from '@/components/ui/Icon';
import type { TeamMember } from '@/types/pokemon';

export function TeamChecklist() {
  const team = useTeamStore((s) => s.current);
  const members = team.filter(Boolean) as TeamMember[];

  const items = useMemo(() => analyzeChecklist(members), [members]);

  if (members.length === 0) return null;

  const critical = items.filter((i) => i.importance === 'critical');
  const recommended = items.filter((i) => i.importance === 'recommended');
  const situational = items.filter((i) => i.importance === 'situational');

  const score = items.filter((i) => i.found).length;
  const total = items.length;

  // Detect si algún miembro tiene moves asignados
  const anyMovesAssigned = members.some((m) => (m.moves ?? []).length > 0);

  return (
    <div className="card-base p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            ✅ Team Building Checklist
          </h3>
          <p className="text-xs text-ink-dim mt-1">
            Detecta los "ingredientes" básicos de un equipo competitivo. Más
            verdes = equipo más completo.
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold tabular-nums">
            <span className={score >= 5 ? 'text-accent-green' : score >= 3 ? 'text-accent-yellow' : 'text-accent-red'}>
              {score}
            </span>
            <span className="text-ink-faint text-xl"> / {total}</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-ink-faint mt-0.5">
            Completeness
          </div>
        </div>
      </div>

      {!anyMovesAssigned && (
        <div className="card-base p-3 text-xs text-accent-yellow bg-accent-yellow/[0.05] border-accent-yellow/30">
          ⚠ Ningún miembro tiene moves asignados. Edita cada slot del equipo
          para añadir movimientos y el checklist será más preciso.
        </div>
      )}

      <ChecklistSection
        title="🚨 Crítico"
        items={critical}
        tone="text-accent-red"
      />
      <ChecklistSection
        title="⭐ Recomendado"
        items={recommended}
        tone="text-accent-yellow"
      />
      <ChecklistSection
        title="💡 Situacional"
        items={situational}
        tone="text-ink-dim"
      />
    </div>
  );
}

function ChecklistSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: ReturnType<typeof analyzeChecklist>;
  tone: string;
}) {
  return (
    <div>
      <div className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${tone}`}>
        {title}
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-2.5 rounded-lg ${
              item.found
                ? 'bg-accent-green/[0.05]'
                : 'bg-white/[0.02]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full inline-flex items-center justify-center shrink-0 ${
                item.found
                  ? 'bg-accent-green/20 text-accent-green'
                  : 'bg-ink-faint/15 text-ink-faint'
              }`}
            >
              {item.found ? <CheckIcon className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base">{item.emoji}</span>
                <span className="font-display font-bold text-sm">{item.label}</span>
              </div>
              <p className="text-[11px] text-ink-dim mt-0.5">{item.description}</p>
            </div>
            {item.found && item.foundIn.length > 0 && (
              <div className="flex -space-x-2 shrink-0">
                {item.foundIn.slice(0, 3).map((id) => (
                  <img
                    key={id}
                    src={artworkFor(id)}
                    alt=""
                    className="w-8 h-8 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
