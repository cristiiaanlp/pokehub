import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { fetchItemDetail } from '@/lib/pokeapi-database';
import { artworkFor, getPokemon } from '@/lib/pokeapi';
import { ArrowRight, BookOpenIcon } from '@/components/ui/Icon';
import { getItemNote } from '@/lib/items-detail';
import { formatPokemonName } from '@/lib/utils';

export const revalidate = 604800;

interface PageProps {
  params: { name: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await fetchItemDetail(params.name);
  if (!item) return { title: 'Item no encontrado' };
  const curated = getItemNote(params.name);
  return {
    title: `${item.displayName} · Item Pokémon`,
    description: curated?.description || item.shortEffect || `${item.displayName} en Pokémon.`,
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const item = await fetchItemDetail(params.name);
  if (!item) notFound();

  // Overlay competitive curado
  const curated = getItemNote(params.name);
  const notableUsers = curated
    ? await Promise.all(
        curated.notableUsers.map(async (id) => {
          try {
            const p = await getPokemon(id);
            return { id, name: formatPokemonName(p.name) };
          } catch {
            return null;
          }
        })
      ).then((arr) => arr.filter((u): u is NonNullable<typeof u> => u !== null))
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <Link
        href="/database/items"
        className="text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1"
      >
        <BookOpenIcon className="w-3.5 h-3.5" /> Todos los items
      </Link>

      <header className="card-base p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-accent-yellow/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          {item.sprite && (
            <img
              src={item.sprite}
              alt={item.displayName}
              className="w-16 h-16 object-contain shrink-0 [image-rendering:pixelated]"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.3em] text-accent-yellow font-bold mb-1">
              Item #{item.id} · {item.category.replace(/-/g, ' ')}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {item.displayName}
            </h1>
            {item.cost !== null && (
              <div className="text-sm text-ink-dim mt-1 font-mono">
                Precio Pokémart: ¥{item.cost.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </header>

      {item.shortEffect && (
        <section className="card-base p-5">
          <h2 className="font-display text-lg font-bold mb-2">Efecto</h2>
          <p className="text-sm text-ink-soft leading-relaxed">{item.shortEffect}</p>
          {item.effectText && item.effectText !== item.shortEffect && (
            <details className="mt-3 text-xs text-ink-dim">
              <summary className="cursor-pointer hover:text-ink">
                Descripción completa
              </summary>
              <p className="mt-2 leading-relaxed whitespace-pre-line">
                {item.effectText}
              </p>
            </details>
          )}
        </section>
      )}

      {item.flavorText && (
        <section className="card-base p-5 bg-white/[0.02]">
          <p className="text-sm text-ink-dim italic leading-relaxed">
            "{item.flavorText}"
          </p>
        </section>
      )}

      {/* Análisis competitivo curado */}
      {curated && (
        <section className="card-base p-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
          <div className="relative space-y-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-brand-glow" />
              Análisis competitivo
              {curated.tier && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                  curated.tier === 'S' ? 'bg-accent-yellow/20 text-accent-yellow' :
                  curated.tier === 'A' ? 'bg-accent-green/20 text-accent-green' :
                  'bg-white/10 text-ink-soft'
                }`}>
                  Tier {curated.tier}
                </span>
              )}
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              {curated.description}
            </p>
            {curated.notes && (
              <div className="border-l-4 border-l-brand-glow bg-brand/[0.04] rounded-r-lg p-3">
                <div className="text-xs font-bold text-brand-glow mb-1">💡 Tip</div>
                <p className="text-xs text-ink-soft leading-relaxed">{curated.notes}</p>
              </div>
            )}
            {notableUsers.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-2">
                  Usuarios destacados
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {notableUsers.map((u) => (
                    <Link
                      key={u.id}
                      href={`/pokedex/${u.id}`}
                      className="card-base card-hover p-2 text-center group"
                    >
                      <img
                        src={artworkFor(u.id)}
                        alt={u.name}
                        className="w-12 h-12 mx-auto object-contain group-hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                      <div className="text-[10px] font-bold mt-1 truncate">{u.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {item.heldBy.length > 0 && (
        <section className="card-base p-5">
          <h2 className="font-display text-lg font-bold mb-3">
            Pokémon que lo llevan típicamente ({item.heldBy.length})
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
            {item.heldBy.map((p) => (
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

      <div className="text-center pt-4">
        <Link
          href="/database/items"
          className="inline-flex items-center gap-1 text-sm text-brand-glow hover:text-brand-hover"
        >
          ← Buscar más items
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
