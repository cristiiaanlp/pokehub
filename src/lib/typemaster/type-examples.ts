import type { PokemonType } from '@/types/pokemon';

// Iconic Pokémon examples per primary type — used in Learn mode visuals.
export const TYPE_EXAMPLES: Record<PokemonType, { id: number; name: string }[]> = {
  normal: [
    { id: 132, name: 'Ditto' },
    { id: 143, name: 'Snorlax' },
    { id: 162, name: 'Furret' },
  ],
  fire: [
    { id: 6, name: 'Charizard' },
    { id: 38, name: 'Ninetales' },
    { id: 257, name: 'Blaziken' },
  ],
  water: [
    { id: 9, name: 'Blastoise' },
    { id: 130, name: 'Gyarados' },
    { id: 658, name: 'Greninja' },
  ],
  electric: [
    { id: 25, name: 'Pikachu' },
    { id: 145, name: 'Zapdos' },
    { id: 405, name: 'Luxray' },
  ],
  grass: [
    { id: 3, name: 'Venusaur' },
    { id: 254, name: 'Sceptile' },
    { id: 470, name: 'Leafeon' },
  ],
  ice: [
    { id: 144, name: 'Articuno' },
    { id: 471, name: 'Glaceon' },
    { id: 614, name: 'Beartic' },
  ],
  fighting: [
    { id: 68, name: 'Machamp' },
    { id: 214, name: 'Heracross' },
    { id: 448, name: 'Lucario' },
  ],
  poison: [
    { id: 169, name: 'Crobat' },
    { id: 89, name: 'Muk' },
    { id: 793, name: 'Nihilego' },
  ],
  ground: [
    { id: 95, name: 'Onix' },
    { id: 260, name: 'Swampert' },
    { id: 530, name: 'Excadrill' },
  ],
  flying: [
    { id: 18, name: 'Pidgeot' },
    { id: 149, name: 'Dragonite' },
    { id: 398, name: 'Staraptor' },
  ],
  psychic: [
    { id: 65, name: 'Alakazam' },
    { id: 150, name: 'Mewtwo' },
    { id: 282, name: 'Gardevoir' },
  ],
  bug: [
    { id: 123, name: 'Scyther' },
    { id: 212, name: 'Scizor' },
    { id: 637, name: 'Volcarona' },
  ],
  rock: [
    { id: 76, name: 'Golem' },
    { id: 248, name: 'Tyranitar' },
    { id: 526, name: 'Gigalith' },
  ],
  ghost: [
    { id: 94, name: 'Gengar' },
    { id: 477, name: 'Dusknoir' },
    { id: 887, name: 'Dragapult' },
  ],
  dragon: [
    { id: 149, name: 'Dragonite' },
    { id: 445, name: 'Garchomp' },
    { id: 384, name: 'Rayquaza' },
  ],
  dark: [
    { id: 197, name: 'Umbreon' },
    { id: 461, name: 'Weavile' },
    { id: 491, name: 'Darkrai' },
  ],
  steel: [
    { id: 376, name: 'Metagross' },
    { id: 306, name: 'Aggron' },
    { id: 681, name: 'Aegislash' },
  ],
  fairy: [
    { id: 36, name: 'Clefable' },
    { id: 282, name: 'Gardevoir' },
    { id: 700, name: 'Sylveon' },
  ],
};

export const TYPE_BLURB: Record<PokemonType, string> = {
  normal:
    'El tipo más equilibrado. Pocos puntos fuertes ofensivos, pero acceso a movimientos versátiles. Inmune al tipo Fantasma.',
  fire:
    'Quema bichos, plantas, hielo y acero. Resiste hada, hielo y planta. Débil ante agua, tierra y roca.',
  water:
    'Apaga fuego, derrite roca y tierra. Resiste fuego, agua, hielo y acero. Débil ante eléctrico y planta.',
  electric:
    'Fritea agua y vuela. Inmune a tierra (su única gran debilidad). Solo planta y dragón resisten su daño.',
  grass:
    'Crece sobre agua, tierra y roca. Sufre contra fuego, vuelo, bicho, veneno, hielo. Muchas debilidades, gran utilidad.',
  ice:
    'Congela dragón, planta, tierra y vuelo (¡el famoso 4× contra Garchomp!). Frágil defensivamente — débil a 4 tipos.',
  fighting:
    'Rompe acero, hielo, normal, roca, oscuro. Inútil contra fantasma. Débil ante vuelo, psíquico y hada.',
  poison:
    'Tóxico para hada y planta. No afecta al tipo Acero. Cobertura limitada, pero excelente para chip damage.',
  ground:
    'Tierra atraviesa fuego, eléctrico, roca, veneno, acero. Inmune a eléctrico — uno de los mejores tipos defensivos.',
  flying:
    'Domina planta, bicho y lucha. Inmune al tipo Tierra. Cuádruple débil a roca y hielo si combina con bicho.',
  psychic:
    'Quema cerebros de lucha y veneno. No afecta a oscuro. Débil ante fantasma, bicho y dark.',
  bug:
    'Devora planta, psíquico y oscuro. Resiste lucha, tierra, planta. Muchas debilidades pero gran utilidad ofensiva.',
  rock:
    'Aplasta fuego, hielo, bicho y vuelo. Defensa física brutal pero débil a especial. Cuidado con lucha, tierra y acero.',
  ghost:
    'Asusta a psíquico y a otros fantasmas. Inmune a normal y lucha. Frenado por oscuro.',
  dragon:
    'Cosa contra dragón. Inmune al tipo... bueno, no inmune a nada. Pero hada lo anula completamente.',
  dark:
    'Engaña a psíquico y fantasma. Inmune al tipo Psíquico. Débil a lucha, bicho y hada.',
  steel:
    'Resiste 11 tipos — el rey defensivo. Inmune a veneno. Solo fuego, lucha y tierra le hacen daño extra.',
  fairy:
    'Mata dragones. Inmune al tipo Dragón. Débil a veneno y acero. Surgió en Gen 6 para equilibrar el meta.',
};
