// Datos enriquecidos para las páginas /database/moves/[slug].
//
// COMPETITIVE_MOVES (src/lib/damage/moves.ts) tiene los datos numéricos
// usados por el damage calc. Aquí añadimos descripción, sets famosos y
// notas competitivas para SEO + UX.

import { COMPETITIVE_MOVES } from './damage/moves';
import type { MoveData } from './damage/formula';

export interface MoveDetail {
  /** Move data crudo del damage calc */
  data: MoveData;
  /** Slug URL-friendly */
  slug: string;
  /** Descripción competitiva 1-2 frases */
  description: string;
  /** Pokémon featured que lo usan habitualmente (PokéAPI ids) */
  notableUsers: number[];
  /** Notas estratégicas adicionales (optional) */
  notes?: string;
}

export function slugifyMove(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[\s\/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Diccionario curado de descripciones competitivas + users notables.
// Para los moves no listados aquí, generamos descripción genérica con la data.
const MOVE_NOTES: Record<string, { description: string; notableUsers: number[]; notes?: string }> = {
  earthquake: {
    description:
      'El move físico Tierra por excelencia. 100 BP, perfect accuracy, sin drawbacks. Spreads damage en doubles (×0.75 cada target) pero pega TODO menos voladores e Inmunes.',
    notableUsers: [445, 984, 472, 248, 968, 1003],
    notes: 'Inmune: Volador, Levitate, Air Balloon. Considera Bulldoze si quieres rebajar Speed en doubles.',
  },
  'close-combat': {
    description:
      'STAB Lucha más usado. 120 BP, 100 acc, -1 Def/-1 SpD self después de hit. El precio del damage masivo.',
    notableUsers: [984, 392, 448, 968, 658],
    notes: 'Drops defensivos rompen Multiscale. No es ideal a low HP — vas a comer el counter-attack más fuerte.',
  },
  'sucker-punch': {
    description:
      'Priority +1 Siniestro, pero CONDICIONAL: solo hit si el target va a usar un attacking move ese turno. Falla si rival hace status/switch.',
    notableUsers: [983, 658, 197, 254],
    notes: 'Mind game move. Si crees que el rival va a usar Protect, no lo uses — perderás el turno.',
  },
  'iron-head': {
    description:
      'STAB Acero estable: 80 BP, 100 acc, 30% chance de flinch. Ideal para outspeeders con base Speed alta.',
    notableUsers: [983, 376, 376],
    notes: 'Si lleva Air Balloon, Iron Head es tu mejor opción anti-Earthquake. Flinch chance es decente.',
  },
  'extreme-speed': {
    description:
      'Priority +2 Normal, 80 BP. Una de las priorities más fuertes del juego. Ignora speed control completamente.',
    notableUsers: [149, 448, 446, 7],
    notes: 'Boosted por STAB en Normales (Arcanine, Lopunny). Perfect para revenge-kill setup sweepers.',
  },
  'knock-off': {
    description:
      '65 BP base + 50% si target tiene item. Quita el item permanentemente. Utility brutal en formatos sin items respawn.',
    notableUsers: [727, 658, 461, 257],
    notes: 'Funciona contra TODO menos Knock Off Resistant items (Mega Stones, Z-Crystals). Lifeorb/Specs víctimas frecuentes.',
  },
  'u-turn': {
    description:
      'Pivot move físico tipo Bug. 70 BP + cambias a otro Pokémon. Mantén momentum + scouting.',
    notableUsers: [727, 169, 472, 887],
    notes: 'Genera información gratis sobre el rival sin comprometer al pivot. Esencial en equipos balance.',
  },
  'volt-switch': {
    description:
      'Versión especial de U-turn, tipo Eléctrico. 70 BP + pivot. No funciona contra Ground types.',
    notableUsers: [145, 658, 462, 488],
    notes: 'Inmune Ground. Run TBolt como backup ofensivo si hay Ground común en rival.',
  },
  'fake-out': {
    description:
      'Priority +3 Normal, 40 BP, 100% flinch chance. Solo funciona en el primer turno que el Pokémon entra. VGC: el move más usado del meta.',
    notableUsers: [727, 132, 142],
    notes: 'Doubles staple. Disabled si Pokémon ya estuvo en field. Pierde a Inner Focus + Tera Ghost.',
  },
  'stealth-rock': {
    description:
      'El hazard #1 de competitivo. Daña al rival al entrar según su weakness a Rock (12.5% neutral, 25% × weak, 50% si 4× weak).',
    notableUsers: [248, 376, 472, 547],
    notes: 'Esencial en cualquier OU/UU team. Rocks pegan SIEMPRE — no se evitan con immunities (excepto Magic Bounce).',
  },
  spikes: {
    description:
      'Hazard físico apilable hasta 3 capas. 1 capa = 12.5% HP entrante, 3 capas = 25%. Solo afecta a non-Flying / non-Levitate.',
    notableUsers: [211, 478, 547, 145],
    notes: 'Mejor que Stealth Rock contra teams sin Flying. Apila con Toxic Spikes para chip cumulativo brutal.',
  },
  'rapid-spin': {
    description:
      'Limpia hazards + 50% Speed boost (Gen 8+). Hit físico 50 BP de bono. La forma menos arriesgada de limpiar hazards.',
    notableUsers: [984, 1003, 503, 437],
    notes: 'Bloqueado por Ghost types (Gholdengo, Dragapult). En ese caso, usa Defog o KO al spinblocker primero.',
  },
  defog: {
    description:
      'Limpia hazards de AMBOS lados + reduce evasion. Vuela. NO bloqueado por Ghosts (a diferencia de Rapid Spin).',
    notableUsers: [145, 169, 248, 6],
    notes: 'Útil si tu rival no necesita los hazards. Si TÚ tienes hazards, prefieres Rapid Spin o cleric.',
  },
  protect: {
    description:
      'Priority +4. Bloquea cualquier move. Si usas dos turnos seguidos, falla con 33% probabilidad.',
    notableUsers: [727, 472, 488, 197],
    notes: 'VGC staple. Útil con Leftovers/Poison Heal para sustain. NO usar 3 turnos seguidos.',
  },
  recover: {
    description:
      'Recupera 50% HP. Sin drawbacks. La forma más eficiente de heal en singles para walls/sweepers.',
    notableUsers: [248, 113, 124, 195],
    notes: 'Heal Bell + Recover = stall machine. No usar contra Taunt/Heal Block users.',
  },
  'will-o-wisp': {
    description:
      'Burn al target. -50% Atk + chip 6.25%/turno. Las walls especiales lo aman.',
    notableUsers: [592, 145, 6, 727],
    notes: 'Inmune: Fuego. Pierde contra Heatran/Cinderace si Tera ≠ Fire. Magic Bounce lo rebota.',
  },
  toxic: {
    description:
      'Bad poison: chip damage que escala (1/16, 2/16, 3/16…). 90 acc. Inmune Acero y Veneno.',
    notableUsers: [472, 145, 113],
    notes: 'En SV Gen 9 SOLO los tipo Veneno pueden aprenderlo por nivel. Otros vía TM, pero solo lo aprenden algunos.',
  },
  'swords-dance': {
    description:
      '+2 Atk. Setup move definitivo para físicos. Si sobrevives el turno de setup, normalmente ganas.',
    notableUsers: [983, 887, 448, 658],
    notes: 'Combina con Lum Berry para evitar status disruption. Sigue rompiendo defensas tras Tera.',
  },
  'dragon-dance': {
    description:
      '+1 Atk +1 Speed. El setup move más roto de Pokémon. Cleanea casi cualquier partida.',
    notableUsers: [149, 887, 130, 230],
    notes: 'Dragonite tras DD = win condition #1. Encore lo bloquea — cuidado con Encore + Scarf.',
  },
  'calm-mind': {
    description:
      '+1 SpA +1 SpD. Setup para sweepers especiales. La opción frente Nasty Plot si necesitas bulk también.',
    notableUsers: [380, 1006, 1021, 786],
    notes: 'Stallbreaker contra walls especiales. Con Stored Power escala absurdamente.',
  },
  'nasty-plot': {
    description:
      '+2 SpA. Setup especial puro. Riesgo: no boost defensivo, solo offense.',
    notableUsers: [658, 1000, 887, 462],
    notes: 'Combina con Choice Scarf alternative — Specs ya da daño masivo, NP es para sweep sin lock.',
  },
};

/** Genera la lista completa de move details mergeando MOVE_NOTES + COMPETITIVE_MOVES */
export function getAllMoveDetails(): MoveDetail[] {
  return COMPETITIVE_MOVES.map((data) => {
    const slug = slugifyMove(data.name);
    const note = MOVE_NOTES[slug];
    return {
      data,
      slug,
      description:
        note?.description ?? generateGenericDescription(data),
      notableUsers: note?.notableUsers ?? [],
      notes: note?.notes,
    };
  });
}

export function getMoveDetail(slug: string): MoveDetail | undefined {
  return getAllMoveDetails().find((m) => m.slug === slug);
}

export function getAllMoveSlugs(): string[] {
  return COMPETITIVE_MOVES.map((m) => slugifyMove(m.name));
}

function generateGenericDescription(data: MoveData): string {
  const parts: string[] = [];
  parts.push(`Move ${data.category} tipo ${data.type}.`);
  parts.push(`${data.basePower} BP${data.accuracy ? ` con ${data.accuracy}% accuracy` : ''}.`);
  if (data.priority && data.priority > 0) {
    parts.push(`Priority +${data.priority} — golpea antes que la mayoría de moves.`);
  }
  if (data.tags?.includes('multi-hit')) {
    parts.push('Multi-hit: pega 2-5 veces por turno.');
  }
  if (data.tags?.includes('recoil')) {
    parts.push('Recoil: el usuario recibe daño tras impactar.');
  }
  if (data.tags?.includes('contact')) {
    parts.push('Contact: activa habilidades como Static, Flame Body o Rough Skin.');
  }
  return parts.join(' ');
}
