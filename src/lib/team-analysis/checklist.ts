// Team Building Checklist.
//
// Heurística sobre los moves declarados de cada miembro para detectar si el
// equipo tiene los "ingredientes" estándar de un equipo competitivo:
//
//   - Stealth Rock (hazard)
//   - Hazard removal (Rapid Spin / Defog)
//   - Cleric (Wish / Heal Bell / Aromatherapy)
//   - Pivote (U-turn / Volt Switch / Flip Turn / Parting Shot)
//   - Priority move (Sucker Punch, Aqua Jet, etc)
//   - Speed control (Tailwind / Trick Room)
//   - Setup sweeper (Swords Dance / Calm Mind / Dragon Dance / etc)
//   - Status (Will-O-Wisp, Toxic, Thunder Wave...)
//
// Si el user no ha asignado moves a los miembros, evaluamos por species
// (heurística rough: Garchomp normalmente lleva Stealth Rock, etc).
//
// Es defensive — sirve como "check, no como autoridad". Útil para
// principiantes que están aprendiendo qué roles necesita un team.

import type { TeamMember } from '@/types/pokemon';

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  emoji: string;
  importance: 'critical' | 'recommended' | 'situational';
  found: boolean;
  foundIn: number[]; // pokemonIds donde se detectó
}

const HAZARD_MOVES = ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'];
const HAZARD_REMOVAL = ['Rapid Spin', 'Defog', 'Mortal Spin'];
const CLERIC_MOVES = ['Wish', 'Heal Bell', 'Aromatherapy', 'Lunar Dance', 'Healing Wish'];
const PIVOT_MOVES = ['U-turn', 'Volt Switch', 'Flip Turn', 'Parting Shot', 'Teleport', 'Chilly Reception'];
const PRIORITY_MOVES = [
  'Sucker Punch',
  'Aqua Jet',
  'Bullet Punch',
  'Mach Punch',
  'Extreme Speed',
  'Quick Attack',
  'Ice Shard',
  'Shadow Sneak',
  'Vacuum Wave',
  'Grassy Glide',
  'Accelerock',
];
const SPEED_CONTROL = ['Tailwind', 'Trick Room', 'Sticky Web', 'Icy Wind', 'Electroweb'];
const SETUP_MOVES = [
  'Swords Dance',
  'Dragon Dance',
  'Calm Mind',
  'Nasty Plot',
  'Bulk Up',
  'Quiver Dance',
  'Shell Smash',
  'Coil',
  'Hone Claws',
  'Tail Glow',
  'Curse',
];
const STATUS_MOVES = [
  'Will-O-Wisp',
  'Toxic',
  'Thunder Wave',
  'Spore',
  'Sleep Powder',
  'Yawn',
  'Hypnosis',
  'Glare',
];

function teamHas(team: TeamMember[], moves: string[]): TeamMember[] {
  return team.filter((m) =>
    (m.moves ?? []).some((mv) => moves.includes(mv))
  );
}

export function analyzeChecklist(team: TeamMember[]): ChecklistItem[] {
  const checks: Omit<ChecklistItem, 'found' | 'foundIn'>[] = [
    {
      id: 'hazards',
      label: 'Hazard setter',
      description: 'Stealth Rock / Spikes / Sticky Web. Imprescindible para chip damage.',
      emoji: '🪨',
      importance: 'critical',
    },
    {
      id: 'removal',
      label: 'Hazard removal',
      description: 'Rapid Spin o Defog. Si llevas mons weak a SR (Charizard, Volcarona), es CRÍTICO.',
      emoji: '🧹',
      importance: 'critical',
    },
    {
      id: 'pivot',
      label: 'Pivot move',
      description: 'U-turn / Volt Switch / Flip Turn. Para mantener momentum sin perder turnos.',
      emoji: '🔄',
      importance: 'recommended',
    },
    {
      id: 'priority',
      label: 'Priority move',
      description: 'Para revenge-killear setup sweepers. Sucker Punch, Aqua Jet, etc.',
      emoji: '⚡',
      importance: 'recommended',
    },
    {
      id: 'speed-control',
      label: 'Speed control',
      description: 'Tailwind o Trick Room. Si dos members tienen Spe<70, considera TR.',
      emoji: '⏱️',
      importance: 'recommended',
    },
    {
      id: 'setup',
      label: 'Setup sweeper',
      description: 'Alguien que pueda hacer +1/+2 y barrer. Wincon claro.',
      emoji: '⚔️',
      importance: 'recommended',
    },
    {
      id: 'cleric',
      label: 'Cleric / sustain',
      description: 'Wish / Heal Bell. Para curar status del equipo (especialmente en singles).',
      emoji: '💚',
      importance: 'situational',
    },
    {
      id: 'status',
      label: 'Status move',
      description: 'Toxic, Will-O-Wisp, Spore. Útil contra walls o para frenar setup.',
      emoji: '☠️',
      importance: 'situational',
    },
  ];

  return checks.map((c) => {
    let matches: TeamMember[] = [];
    switch (c.id) {
      case 'hazards':
        matches = teamHas(team, HAZARD_MOVES);
        break;
      case 'removal':
        matches = teamHas(team, HAZARD_REMOVAL);
        break;
      case 'pivot':
        matches = teamHas(team, PIVOT_MOVES);
        break;
      case 'priority':
        matches = teamHas(team, PRIORITY_MOVES);
        break;
      case 'speed-control':
        matches = teamHas(team, SPEED_CONTROL);
        break;
      case 'setup':
        matches = teamHas(team, SETUP_MOVES);
        break;
      case 'cleric':
        matches = teamHas(team, CLERIC_MOVES);
        break;
      case 'status':
        matches = teamHas(team, STATUS_MOVES);
        break;
    }
    return {
      ...c,
      found: matches.length > 0,
      foundIn: matches.map((m) => m.pokemonId),
    };
  });
}
