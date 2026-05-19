'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/common/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { artworkFor } from '@/lib/pokeapi';
import { fetchPublicTeams } from '@/lib/sync/public-teams';
import type { SavedTeam } from '@/stores/teamStore';
import {
  TrophyIcon,
  ArrowRight,
  SparklesIcon,
  UsersIcon,
} from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

const FORMAT_FILTERS = [
  { id: null, label: 'Todos' },
  { id: 'gen9ou', label: 'SV OU' },
  { id: 'gen9vgc', label: 'SV VGC' },
  { id: 'reg-ma', label: 'Champions Reg M-A' },
];

export default function CommunityTeamsPage() {
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');
  const { isConfigured, user } = useAuth();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPublicTeams({ format, sort, limit: 60 })
      .then((data) => {
        if (!cancelled) setTeams(data);
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los equipos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [format, sort, isConfigured]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <PageHeader
        kicker="Comunidad"
        title={
          <>
            Equipos <span className="gradient-text">compartidos</span> por la
            comunidad
          </>
        }
        subtitle="Explora equipos que jugadores reales han hecho públicos. Copia, importa al Team Builder y úsalos como base."
        right={
          user && (
            <Link
              href="/team-builder"
              className="text-sm text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
            >
              Compartir el mío
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )
        }
      />

      {/* Filters */}
      <div className="card-base p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mr-1">
            Formato:
          </span>
          {FORMAT_FILTERS.map((f) => (
            <button
              key={f.id ?? 'all'}
              onClick={() => setFormat(f.id)}
              className={cn(
                'h-8 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
                format === f.id
                  ? 'bg-ink text-bg-950'
                  : 'glass text-ink-soft hover:text-ink'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mr-1">
            Orden:
          </span>
          <button
            onClick={() => setSort('recent')}
            className={cn(
              'h-8 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
              sort === 'recent'
                ? 'bg-ink text-bg-950'
                : 'glass text-ink-soft hover:text-ink'
            )}
          >
            Recientes
          </button>
          <button
            onClick={() => setSort('oldest')}
            className={cn(
              'h-8 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-colors',
              sort === 'oldest'
                ? 'bg-ink text-bg-950'
                : 'glass text-ink-soft hover:text-ink'
            )}
          >
            Antiguos
          </button>
        </div>
      </div>

      {!isConfigured && (
        <div className="card-base p-6 text-center">
          <UsersIcon className="w-8 h-8 text-ink-faint mx-auto mb-2" />
          <p className="text-sm text-ink-soft">
            La galería de comunidad requiere Supabase configurado.
          </p>
        </div>
      )}

      {error && (
        <div className="card-base p-6 text-center text-accent-red">{error}</div>
      )}

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      )}

      {!loading && teams.length === 0 && isConfigured && !error && (
        <div className="card-base p-10 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-accent-yellow/15 text-accent-yellow inline-flex items-center justify-center mb-3">
            <SparklesIcon className="w-7 h-7" />
          </div>
          <h3 className="font-display text-lg font-bold mb-1">
            Aún no hay equipos públicos
          </h3>
          <p className="text-sm text-ink-dim mb-5">
            Sé el primero. Crea un equipo en el Team Builder y dale a{' '}
            <strong className="text-ink">🔗 Compartir</strong>.
          </p>
          <Link
            href="/team-builder"
            className="h-11 px-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-white text-sm font-bold shadow-glow"
          >
            Ir al Team Builder
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {!loading && teams.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map((t, i) => (
            <TeamGridCard team={t} key={t.id} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamGridCard({ team, index }: { team: SavedTeam; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link
        href={`/teams/${team.shareSlug}`}
        className="block card-base card-hover p-4 group relative overflow-hidden h-full"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-widest text-brand-glow font-semibold">
              {team.format
                ? team.format.replace('gen9', 'SV ').toUpperCase()
                : 'Equipo'}
            </div>
            <div className="text-[10px] text-ink-faint">
              {new Date(team.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <h3 className="font-display text-lg font-bold leading-tight truncate">
            {team.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {team.members.slice(0, 6).map((m) => (
              <img
                key={m.pokemonId}
                src={artworkFor(m.pokemonId)}
                alt={m.name}
                className="w-12 h-12 object-contain rounded-md bg-white/[0.03] group-hover:scale-110 transition-transform"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = m.sprite;
                }}
              />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
            <span className="text-ink-faint">
              {team.members.length}/6 Pokémon
            </span>
            <span className="inline-flex items-center gap-1 text-brand-glow font-semibold">
              <TrophyIcon className="w-3.5 h-3.5" />
              Ver equipo
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
