'use client';

import { useMemo, useState } from 'react';
import { TeamCard } from '@/components/meta/TeamCard';
import { PageHeader } from '@/components/common/PageHeader';
import { CHAMPIONS_SAMPLE_TEAMS } from '@/lib/champions/data';
import { TrophyIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

type FilterFormat = 'all' | 'reg-ma' | 'gen9ou' | 'gen9vgc';
type FilterArchetype = 'all' | string;

const ALL_TEAMS = [...CHAMPIONS_SAMPLE_TEAMS];

export default function TeamsExplorerPage() {
  const [format, setFormat] = useState<FilterFormat>('all');
  const [archetype, setArchetype] = useState<FilterArchetype>('all');

  const archetypes = useMemo(() => {
    const set = new Set(ALL_TEAMS.map((t) => t.archetype));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    return ALL_TEAMS.filter((t) => {
      if (format !== 'all' && t.format !== format) return false;
      if (archetype !== 'all' && t.archetype !== archetype) return false;
      return true;
    });
  }, [format, archetype]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <PageHeader
        kicker="Explorador de equipos"
        title={
          <>
            Equipos <span className="gradient-text">reales</span> de torneos
          </>
        }
        subtitle="Teams que han hecho top cut, importables al Pokémon Showdown con un clic. Más equipos llegarán cada semana."
      />

      <div className="card-base p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-widest text-ink-faint font-semibold mr-1">
            Formato:
          </span>
          {(
            [
              ['all', 'Todos'],
              ['reg-ma', 'Champions M-A'],
              ['gen9ou', 'SV OU'],
              ['gen9vgc', 'SV VGC'],
            ] as [FilterFormat, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFormat(id)}
              className={cn(
                'h-8 px-3 inline-flex items-center rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
                format === id
                  ? 'bg-ink text-bg-950'
                  : 'glass text-ink-soft hover:text-ink'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-widest text-ink-faint font-semibold mr-1">
            Arquetipo:
          </span>
          <button
            onClick={() => setArchetype('all')}
            className={cn(
              'h-8 px-3 inline-flex items-center rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
              archetype === 'all'
                ? 'bg-ink text-bg-950'
                : 'glass text-ink-soft hover:text-ink'
            )}
          >
            Todos
          </button>
          {archetypes.map((a) => (
            <button
              key={a}
              onClick={() => setArchetype(a)}
              className={cn(
                'h-8 px-3 inline-flex items-center rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
                archetype === a
                  ? 'bg-ink text-bg-950'
                  : 'glass text-ink-soft hover:text-ink'
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-ink-dim">
          <span className="font-bold text-ink">{filtered.length}</span> equipos
        </div>
        <div className="flex items-center gap-1.5 text-ink-faint text-xs">
          <TrophyIcon className="w-3.5 h-3.5 text-accent-yellow" />
          Fuente: torneos oficiales
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-base p-12 text-center">
          <div className="text-4xl mb-2">🤔</div>
          <div className="font-semibold">Sin equipos con esos filtros</div>
          <div className="text-sm text-ink-dim mt-1">
            Prueba a quitar algún filtro.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}
