import { cn } from '@/lib/utils';
import type { PokemonType } from '@/types/pokemon';

const TYPE_BG: Record<PokemonType, string> = {
  normal: 'bg-type-normal/90 text-zinc-900',
  fire: 'bg-type-fire/90 text-white',
  water: 'bg-type-water/90 text-white',
  electric: 'bg-type-electric/90 text-zinc-900',
  grass: 'bg-type-grass/90 text-white',
  ice: 'bg-type-ice/90 text-zinc-900',
  fighting: 'bg-type-fighting/90 text-white',
  poison: 'bg-type-poison/90 text-white',
  ground: 'bg-type-ground/90 text-zinc-900',
  flying: 'bg-type-flying/90 text-zinc-900',
  psychic: 'bg-type-psychic/90 text-white',
  bug: 'bg-type-bug/90 text-white',
  rock: 'bg-type-rock/90 text-white',
  ghost: 'bg-type-ghost/90 text-white',
  dragon: 'bg-type-dragon/90 text-white',
  dark: 'bg-type-dark/90 text-white',
  steel: 'bg-type-steel/90 text-zinc-900',
  fairy: 'bg-type-fairy/90 text-white',
};

interface Props {
  type: PokemonType;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SIZE = {
  xs: 'h-5 px-2 text-[10px]',
  sm: 'h-6 px-2.5 text-xs',
  md: 'h-7 px-3 text-sm',
};

export function TypeBadge({ type, size = 'sm', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wide rounded-md',
        TYPE_BG[type],
        SIZE[size],
        className
      )}
    >
      {type}
    </span>
  );
}

export function TYPE_HEX(type: PokemonType) {
  const HEX: Record<PokemonType, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
  };
  return HEX[type];
}
