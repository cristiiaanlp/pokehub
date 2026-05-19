// Featured teams strip — rendered on the landing. SSR with 5min revalidate.
// Uses the anon client gated by the RLS "anyone reads featured teams" policy.

import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase-server';
import { artworkFor } from '@/lib/pokeapi';
import { TrophyIcon, ArrowRight } from '@/components/ui/Icon';

interface Team {
  id: string;
  name: string;
  members: any[];
  format: string | null;
  featured_note: string | null;
}

async function fetchFeatured(): Promise<Team[]> {
  const sb = getSupabaseServer();
  if (!sb) return [];
  const { data } = await sb
    .from('teams')
    .select('id, name, members, format, featured_note, featured_at')
    .eq('is_featured', true)
    .order('featured_at', { ascending: false })
    .limit(6);
  return (data ?? []) as Team[];
}

export async function FeaturedTeamsStrip() {
  const teams = await fetchFeatured();
  if (teams.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-accent-yellow font-bold mb-1 inline-flex items-center gap-1">
            <TrophyIcon className="w-3 h-3" />
            Destacados por el equipo
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Equipos recomendados
          </h2>
        </div>
        <Link
          href="/community/teams"
          className="text-xs text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teams.map((t) => (
          <Link
            key={t.id}
            href={`/teams/${t.id}`}
            className="card-base card-hover p-4 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-bold truncate">{t.name}</div>
              {t.format && (
                <span className="text-[9px] font-mono text-ink-faint shrink-0 ml-2">
                  {t.format}
                </span>
              )}
            </div>
            <div className="flex -space-x-3 mb-3">
              {(t.members ?? []).slice(0, 6).map((m: any) => (
                <img
                  key={m.pokemonId}
                  src={artworkFor(m.pokemonId)}
                  alt={m.name}
                  className="w-12 h-12 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = m.sprite ?? '';
                  }}
                />
              ))}
            </div>
            {t.featured_note && (
              <p className="text-xs text-ink-dim italic line-clamp-2">
                “{t.featured_note}”
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
