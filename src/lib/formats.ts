// Reglas de formato competitivo. No es exhaustivo (eso lo hace Showdown's teambuilder)
// pero cubre los 5 formatos más jugados con la legalidad estándar.

export interface FormatRule {
  id: string;
  name: string;
  description: string;
  teamSize: { min: number; max: number };
  // IDs de Pokémon prohibidos. Pokémon "restricted" en VGC son los box legendaries.
  banned: number[];
  // Solo 1 instancia por especie en el mismo equipo (species clause).
  speciesClause: boolean;
  // Solo 1 instancia del mismo item (item clause). Estándar en VGC Reg.
  itemClause: boolean;
  // Nivel forzado para todos los Pokémon (50 en VGC, 100 en OU/etc).
  level: number;
  // Máximo de "restricted" permitidos (Reg G permite hasta 2).
  maxRestricted?: number;
  // IDs de Pokémon "restricted" (cuentan en maxRestricted).
  restricted?: number[];
}

// Restricted en Reg G: box legendaries + Paradox especiales
const REG_G_RESTRICTED = [
  150, // Mewtwo
  249, 250, // Lugia, Ho-Oh
  382, 383, 384, // Kyogre, Groudon, Rayquaza
  483, 484, 487, // Dialga, Palkia, Giratina
  643, 644, 646, // Reshiram, Zekrom, Kyurem
  716, 717, 718, // Xerneas, Yveltal, Zygarde
  789, 790, 791, 792, 800, // Cosmog line + Necrozma
  888, 889, // Zacian, Zamazenta
  890, // Eternatus
  898, // Calyrex (forms)
  1007, 1008, // Koraidon, Miraidon
  1024, // Terapagos
];

// Banlist universal: legendarios míticos + Cosmog (no jugable)
const MYTHICALS = [
  151, // Mew
  251, // Celebi
  385, // Jirachi
  386, // Deoxys
  489, 490, // Phione, Manaphy
  491, // Darkrai
  492, // Shaymin
  493, // Arceus
  494, // Victini
  647, // Keldeo
  648, // Meloetta
  649, // Genesect
  719, // Diancie
  720, // Hoopa
  721, // Volcanion
  801, // Magearna
  802, // Marshadow
  807, // Zeraora
  808, 809, // Meltan, Melmetal
];

export const FORMATS: FormatRule[] = [
  {
    id: 'vgc-reg-g',
    name: 'VGC 2026 — Reg G (Dobles)',
    description:
      'Dos restringidos permitidos. Item clause activo. Lv50. El formato actual oficial de campeonatos.',
    teamSize: { min: 4, max: 6 },
    banned: MYTHICALS,
    speciesClause: true,
    itemClause: true,
    level: 50,
    maxRestricted: 2,
    restricted: REG_G_RESTRICTED,
  },
  {
    id: 'vgc-reg-h',
    name: 'VGC — Reg H (Dobles sin paradox)',
    description: 'Sin Paradox, sin restringidos, sin legendarios. Pre-Hidden Treasure.',
    teamSize: { min: 4, max: 6 },
    banned: [
      ...MYTHICALS,
      ...REG_G_RESTRICTED,
      // Paradox SV
      984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995,
      1005, 1006, 1009, 1010, 1020, 1021, 1022, 1023,
    ],
    speciesClause: true,
    itemClause: true,
    level: 50,
  },
  {
    id: 'gen9-ou',
    name: 'Smogon Gen 9 OU (Singles)',
    description:
      'Smogon OverUsed. Sin Ubers (box legendaries banneados). Singles lvl 100.',
    teamSize: { min: 1, max: 6 },
    banned: [
      ...MYTHICALS,
      150, 249, 250, 382, 383, 384, 484, 487, 643, 644, 646, 716, 717,
      718, 789, 790, 791, 792, 888, 889, 890, 898, 1007, 1008, 1024,
      // Banneos OU específicos típicos
      493, // Arceus
      493,
      797, // Celesteela (allowed actually, leaving)
      // Estos cambian mes a mes; mantener lista corta
    ],
    speciesClause: true,
    itemClause: false,
    level: 100,
  },
  {
    id: 'gen9-ubers',
    name: 'Smogon Gen 9 Ubers (Singles)',
    description: 'Cualquier Pokémon excepto Mythicals con uso reportado infinito.',
    teamSize: { min: 1, max: 6 },
    banned: [], // Permitivo
    speciesClause: true,
    itemClause: false,
    level: 100,
  },
  {
    id: 'monotype',
    name: 'Monotype (Singles)',
    description: 'Todos los miembros comparten al menos 1 tipo.',
    teamSize: { min: 1, max: 6 },
    banned: MYTHICALS,
    speciesClause: true,
    itemClause: false,
    level: 100,
  },
];

export function getFormat(id: string): FormatRule | undefined {
  return FORMATS.find((f) => f.id === id);
}
