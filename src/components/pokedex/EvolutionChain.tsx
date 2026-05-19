import { Link } from '@/i18n/routing';
import type { PokemonEvolution } from '@/types/pokemon';
import { ChevronRight } from '@/components/ui/Icon';
import { formatPokemonName, padId } from '@/lib/utils';
import { artworkFor } from '@/lib/pokeapi';

export function EvolutionChain({
  chain,
  currentId,
}: {
  chain: PokemonEvolution[][];
  currentId: number;
}) {
  if (!chain.length) {
    return (
      <div className="text-sm text-ink-dim">
        Este Pokémon no tiene cadena evolutiva.
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 justify-center">
      {chain.map((stage, stageIdx) => (
        <div key={stageIdx} className="flex items-center gap-3">
          <div className="flex flex-col gap-3">
            {stage.map((evo) => (
              <Link
                key={evo.id}
                href={`/pokedex/${evo.id}`}
                className={`group flex flex-col items-center gap-1 p-3 rounded-2xl glass card-hover w-32 ${
                  evo.id === currentId ? 'ring-2 ring-brand' : ''
                }`}
              >
                <img
                  src={artworkFor(evo.id)}
                  alt={evo.name}
                  className="w-20 h-20 object-contain group-hover:scale-110 transition-transform"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = evo.sprite;
                  }}
                />
                <div className="text-[10px] font-mono text-ink-faint">
                  #{padId(evo.id)}
                </div>
                <div className="text-xs font-semibold text-center truncate w-full">
                  {formatPokemonName(evo.name)}
                </div>
                {evo.minLevel && (
                  <div className="text-[10px] text-brand-glow font-mono">
                    Nv. {evo.minLevel}
                  </div>
                )}
                {evo.item && !evo.minLevel && (
                  <div className="text-[10px] text-accent-yellow font-mono truncate w-full text-center">
                    {evo.item.replace(/-/g, ' ')}
                  </div>
                )}
              </Link>
            ))}
          </div>
          {stageIdx < chain.length - 1 && (
            <ChevronRight className="w-6 h-6 text-ink-faint shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
