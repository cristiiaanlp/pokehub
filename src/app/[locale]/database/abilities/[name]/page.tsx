import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { fetchAbilityDetail } from '@/lib/pokeapi-database';
import { artworkFor } from '@/lib/pokeapi';
import { ArrowRight, BookOpenIcon, SparklesIcon } from '@/components/ui/Icon';

export const revalidate = 604800;

interface PageProps {
  params: { name: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const ability = await fetchAbilityDetail(params.name);
  if (!ability) return { title: 'Habilidad no encontrada' };
  return {
    title: `${ability.displayName} · Habilidad Pokémon`,
    description: ability.shortEffect || `${ability.displayName} en Pokémon.`,
  };
}

export default async function AbilityDetailPage({ params }: PageProps) {
  const ability = await fetchAbilityDetail(params.name);
  if (!ability) notFound();

  const visible = ability.pokemonWith.filter((p) => !p.isHidden);
  const hidden = ability.pokemonWith.filter((p) => p.isHidden);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <Link
        href="/database/abilities"
        className="text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1"
      >
        <BookOpenIcon className="w-3.5 h-3.5" /> Todas las habilidades
      </Link>

      <header className="card-base p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-accent-yellow/15 blur-3xl pointer-events-none" />
        <div className="relative space-y-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-accent-yellow font-bold inline-flex items-center gap-1">
            <SparklesIcon className="w-3 h-3" />
            Habilidad #{ability.id}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {ability.displayName}
          </h1>
          {ability.shortEffect && (
            <p className="text-sm text-ink-soft leading-relaxed mt-3">
              {ability.shortEffect}
            </p>
          )}
        </div>
      </header>

      {ability.effectText && ability.effectText !== ability.shortEffect && (
        <section className="card-base p-5">
          <h2 className="font-display text-lg font-bold mb-2">Descripción completa</h2>
          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
            {ability.effectText}
          </p>
        </section>
      )}

      {ability.flavorText && (
        <section className="card-base p-5 bg-white/[0.02]">
          <p className="text-sm text-ink-dim italic leading-relaxed">
            "{ability.flavorText}"
          </p>
        </section>
      )}

      {visible.length > 0 && (
        <section className="card-base p-5">
          <h2 className="font-display text-lg font-bold mb-3">
            Pokémon con esta habilidad ({visible.length})
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            {visible.map((p) => (
              <Link
                key={p.id}
                href={`/pokedex/${p.id}`}
                className="card-base card-hover p-2 text-center group"
              >
                <img
                  src={artworkFor(p.id)}
                  alt={p.name}
                  className="w-14 h-14 mx-auto object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
                <div className="text-[10px] capitalize mt-1 truncate">
                  {p.name.replace(/-/g, ' ')}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {hidden.length > 0 && (
        <section className="card-base p-5 border-accent-yellow/30">
          <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-accent-yellow" />
            Como hidden ability ({hidden.length})
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            {hidden.map((p) => (
              <Link
                key={p.id}
                href={`/pokedex/${p.id}`}
                className="card-base card-hover p-2 text-center group border-accent-yellow/20"
              >
                <img
                  src={artworkFor(p.id)}
                  alt={p.name}
                  className="w-14 h-14 mx-auto object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
                <div className="text-[10px] capitalize mt-1 truncate">
                  {p.name.replace(/-/g, ' ')}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="text-center pt-4">
        <Link
          href="/database/abilities"
          className="inline-flex items-center gap-1 text-sm text-brand-glow hover:text-brand-hover"
        >
          ← Buscar más habilidades
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
