export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  types: PokemonType[];
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonMove {
  name: string;
  level?: number;
  method?: string;
}

export interface PokemonEvolution {
  id: number;
  name: string;
  sprite: string;
  minLevel?: number;
  trigger?: string;
  item?: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonType[];
  height: number;
  weight: number;
  sprite: string;
  artwork: string;
  shinyArtwork: string;
  cry: string | null;
  stats: PokemonStats;
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  baseExperience: number;
  flavorText: string;
  genus: string;
  generation: string;
  evolutionChain: PokemonEvolution[][];
}

export interface TeamMember {
  pokemonId: number;
  name: string;
  sprite: string;
  types: PokemonType[];
  stats: PokemonStats;
  abilities: PokemonAbility[];
  ability?: string;
  item?: string;
  nature?: string;
  moves: string[];
  evs?: PokemonStats;
  ivs?: PokemonStats;
  level?: number;
  shiny?: boolean;
  nickname?: string;
}

export interface TypeEffectivenessRow {
  type: PokemonType;
  multiplier: number;
}
