import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getPokemon } from '@/lib/pokeapi';
import { PokemonDetailView } from '@/components/pokedex/PokemonDetail';
import { formatPokemonName } from '@/lib/utils';
import { fetchPokemonData, PIKA_FORMAT_LABELS } from '@/lib/pikalytics/client';
import { enrichPikalyticsData } from '@/lib/pikalytics/enrich';
import { TrophyIcon, ArrowRight } from '@/components/ui/Icon';
import { RecentTracker } from '@/components/common/RecentTracker';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  try {
    const p = await getPokemon(params.id);
    return {
      title: `${formatPokemonName(p.name)} · PokéHub`,
      description:
        p.flavorText || `Detalle de ${formatPokemonName(p.name)} en PokéHub`,
    };
  } catch {
    return { title: 'Pokémon · PokéHub' };
  }
}

// Convert PokéAPI species name (kebab) to a display name
// suitable for Pikalytics URL slugs.
function toPikalyticsName(speciesName: string): string {
  return speciesName
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('-');
}

export default async function PokemonPage({
  params,
}: {
  params: { id: string };
}) {
  let data;
  try {
    data = await getPokemon(params.id);
  } catch {
    return notFound();
  }

  const pikalyticsName = toPikalyticsName(data.name);
  // Try Champions first (currently active format), fall back to SV OU
  let live = await fetchPokemonData('championspreview', pikalyticsName);
  let liveFormatLabel = PIKA_FORMAT_LABELS['championspreview'];
  if (!live || (live.featuredTeams.length === 0 && live.moves.length === 0)) {
    const fallback = await fetchPokemonData('gen9ou', pikalyticsName);
    if (fallback && (fallback.moves.length > 0 || fallback.featuredTeams.length > 0)) {
      live = fallback;
      liveFormatLabel = PIKA_FORMAT_LABELS['gen9ou'];
    }
  }
  const enrichedLive = live ? await enrichPikalyticsData(live) : null;
  const liveFetchedAt = new Date().toISOString();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-12 space-y-5">
      <RecentTracker id={data.id} name={data.name} />
      <PokemonDetailView
        data={data}
        live={enrichedLive}
        liveFormatLabel={liveFormatLabel}
        liveFetchedAt={liveFetchedAt}
      />
      <Link
        href={`/pokedex/${data.id}/competitive`}
        className="card-base card-hover p-5 flex items-center gap-3 group"
      >
        <div className="w-12 h-12 rounded-xl bg-brand/15 text-brand-glow inline-flex items-center justify-center shrink-0">
          <TrophyIcon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold">
            Análisis competitivo de {formatPokemonName(data.name)}
          </div>
          <div className="text-xs text-ink-dim">
            Sets, counters, partners y rol meta. Página dedicada.
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
