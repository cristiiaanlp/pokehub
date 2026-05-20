// Pool de preguntas trivia competitivas — Gen 9 SV meta.
// Cada pregunta tiene 4 respuestas, una correcta marcada por índice.
// El pool es estático y la rotación es determinista por fecha.

export interface TriviaQuestion {
  q: string;
  options: string[];
  correctIndex: number;
  /** Explicación que aparece al responder */
  explain: string;
  category: 'stats' | 'mecanicas' | 'meta' | 'historia' | 'tipos';
}

export const TRIVIA_POOL: TriviaQuestion[] = [
  // === STATS / BASE ===
  {
    q: '¿Cuál de estos Pokémon tiene Speed base 142 — el más rápido del meta SV OU?',
    options: ['Greninja', 'Dragapult', 'Iron Valiant', 'Sneasler'],
    correctIndex: 1,
    explain: 'Dragapult tiene Speed base 142, el outspeed-er natural más alto del tier.',
    category: 'stats',
  },
  {
    q: '¿Qué Pokémon tiene la BST más alta entre los Paradox de Gen 9?',
    options: ['Iron Valiant', 'Roaring Moon', 'Iron Bundle', 'Walking Wake'],
    correctIndex: 1,
    explain: 'Roaring Moon tiene BST 590, superior a otros Paradox no-restricted.',
    category: 'stats',
  },
  {
    q: '¿Qué nature es la más común en un Kingambit ofensivo?',
    options: ['Jolly', 'Adamant', 'Brave', 'Naive'],
    correctIndex: 1,
    explain: 'Adamant (+Atk -SpA) maximiza damage — Kingambit no necesita Speed por Sucker Punch.',
    category: 'stats',
  },

  // === MECÁNICAS ===
  {
    q: '¿Cuántos turnos dura Tera por defecto en una batalla?',
    options: ['Solo un turno', 'Hasta el switch', 'Resto de la partida', '5 turnos'],
    correctIndex: 2,
    explain: 'Tera dura el resto de la partida una vez activado. Solo se puede usar 1 vez por equipo.',
    category: 'mecanicas',
  },
  {
    q: '¿Qué hace exactamente el ítem Choice Scarf?',
    options: [
      '+50% Speed, bloqueado a 1 move',
      '+50% Atk, bloqueado a 1 move',
      '+30% Speed, sin bloqueo',
      '+50% Speed sin penalización',
    ],
    correctIndex: 0,
    explain: 'Choice Scarf da +50% Speed pero bloquea al usuario al primer move usado hasta que cambie.',
    category: 'mecanicas',
  },
  {
    q: '¿Qué habilidad permite a Gholdengo ser inmune a status moves no-damaging?',
    options: ['Good as Gold', 'Magic Guard', 'Soundproof', 'Levitate'],
    correctIndex: 0,
    explain: 'Good as Gold lo hace inmune a Toxic, Will-O-Wisp, Encore, etc. — pero NO a moves de daño con efecto secundario.',
    category: 'mecanicas',
  },
  {
    q: '¿Qué multiplicador da STAB cuando NO has Tera-rrizado?',
    options: ['×1.25', '×1.5', '×2.0', '×1.33'],
    correctIndex: 1,
    explain: 'STAB normal es ×1.5. Si Teras al mismo tipo que ya tenías, sube a ×2.0.',
    category: 'mecanicas',
  },
  {
    q: '¿Qué hace Protosynthesis (habilidad de los Paradox del pasado)?',
    options: [
      'Boost x1.3 a la stat más alta en sol o con Booster Energy',
      'Inmunidad a fire moves',
      '+50% Speed siempre',
      'Cura al final del turno',
    ],
    correctIndex: 0,
    explain: 'Protosynthesis sube ×1.3 (×1.5 si es Speed) la stat más alta en sol o con Booster Energy.',
    category: 'mecanicas',
  },
  {
    q: '¿Cuál es la prioridad de Sucker Punch?',
    options: ['+0', '+1', '+2', '+3'],
    correctIndex: 1,
    explain: 'Sucker Punch tiene priority +1, pero solo hit si el target va a usar un attacking move ese turno.',
    category: 'mecanicas',
  },
  {
    q: '¿Qué tipo es inmune al estado Burn (no le quita HP al final del turno)?',
    options: ['Fuego', 'Roca', 'Acero', 'Hielo'],
    correctIndex: 0,
    explain: 'Los tipo Fuego no pueden ser quemados — además inmunes al chip damage de burn.',
    category: 'mecanicas',
  },

  // === META Gen 9 SV ===
  {
    q: '¿Cuál es el Pokémon más usado en VGC SV Regulation H?',
    options: ['Incineroar', 'Rillaboom', 'Pelipper', 'Tornadus'],
    correctIndex: 0,
    explain: 'Incineroar es el pivot dominante en VGC SV — Intimidate + Fake Out + Parting Shot.',
    category: 'meta',
  },
  {
    q: '¿Qué Pokémon tiene la habilidad Supreme Overlord?',
    options: ['Tyranitar', 'Kingambit', 'Roaring Moon', 'Garchomp'],
    correctIndex: 1,
    explain: 'Kingambit gana +10% Atk/SpA por cada compañero debilitado (hasta +50%).',
    category: 'meta',
  },
  {
    q: '¿Qué forma de Ogerpon es la más usada en OU Gen 9?',
    options: [
      'Teal (Planta)',
      'Wellspring (Agua)',
      'Hearthflame (Fuego)',
      'Cornerstone (Roca)',
    ],
    correctIndex: 1,
    explain: 'Ogerpon-Wellspring (Agua) es la forma OU por su Embody Aspect (defensa especial).',
    category: 'meta',
  },
  {
    q: '¿Qué Pokémon meta SV es famoso por su Calm Mind + Stored Power sweep?',
    options: ['Espathra', 'Iron Crown', 'Hatterene', 'Indeedee'],
    correctIndex: 0,
    explain: 'Espathra fue tan oppresivo en Calm Mind sets que llegó a estar baneada en su día.',
    category: 'meta',
  },

  // === HISTORIA Pokémon ===
  {
    q: '¿En qué generación se introdujo el tipo Hada?',
    options: ['Gen 5', 'Gen 6', 'Gen 7', 'Gen 8'],
    correctIndex: 1,
    explain: 'El tipo Hada se añadió en Gen 6 (X/Y) para balancear el dominio de los Dragones.',
    category: 'historia',
  },
  {
    q: '¿Qué generación introdujo el mecánico de Tera?',
    options: ['Gen 7', 'Gen 8', 'Gen 9', 'Gen 6'],
    correctIndex: 2,
    explain: 'Tera apareció en Gen 9 (Scarlet/Violet) — sustituyendo a Dynamax y Mega Evolution.',
    category: 'historia',
  },
  {
    q: '¿En qué generación se introdujo Stealth Rock?',
    options: ['Gen 3', 'Gen 4', 'Gen 5', 'Gen 6'],
    correctIndex: 1,
    explain: 'Stealth Rock llegó en Gen 4 (DPP) y cambió el meta para siempre.',
    category: 'historia',
  },
  {
    q: '¿Qué Pokémon fue baneado de OU por primera vez en Gen 1 (1999)?',
    options: ['Mew', 'Mewtwo', 'Dragonite', 'Gengar'],
    correctIndex: 1,
    explain: 'Mewtwo (Gen 1) fue uno de los primeros baneos a Ubers por su BST 680 y movepool absurdo.',
    category: 'historia',
  },

  // === TIPOS / MATCHUPS ===
  {
    q: '¿Qué tipo es 4× efectivo contra Garchomp (Dragón/Tierra)?',
    options: ['Hielo', 'Hada', 'Volador', 'Roca'],
    correctIndex: 0,
    explain: 'Hielo es ×2 vs Dragón y ×2 vs Tierra = 4× total. Glaceon / Mamoswine / Articuno son sus pesadillas.',
    category: 'tipos',
  },
  {
    q: '¿A cuántos tipos resiste el tipo Acero (defensivamente)?',
    options: ['8', '10', '11', '12'],
    correctIndex: 2,
    explain: 'Acero resiste 11 tipos y es inmune al Veneno — el mejor tipo defensivo del juego.',
    category: 'tipos',
  },
  {
    q: '¿Qué tipo es inmune a Earthquake?',
    options: ['Hielo', 'Volador', 'Roca', 'Acero'],
    correctIndex: 1,
    explain: 'Volador (o Pokémon con Levitate / Air Balloon) son inmunes a Earthquake.',
    category: 'tipos',
  },
  {
    q: '¿Cuál de estos NO es débil al tipo Lucha?',
    options: ['Acero', 'Roca', 'Siniestro', 'Hada'],
    correctIndex: 3,
    explain: 'Hada resiste Lucha. Los otros tres (Acero, Roca, Siniestro) son débiles.',
    category: 'tipos',
  },
  {
    q: '¿Qué tipo introdujo Tera Stellar en Gen 9?',
    options: [
      'No es un tipo nuevo, es Tera meta-tipo',
      'Sí, tipo nuevo con sus propias resistencias',
      'Es solo cosmético',
      'Solo lo tiene Terapagos',
    ],
    correctIndex: 0,
    explain: 'Tera Stellar es un Tera type especial — boost ×2 al primer hit de cada tipo. Solo accesible vía Terapagos.',
    category: 'mecanicas',
  },
  {
    q: '¿Qué stat afecta la Naturaleza Modest?',
    options: ['+Atk -Def', '+SpA -Atk', '+Spe -SpA', '+SpD -SpA'],
    correctIndex: 1,
    explain: 'Modest da +10% SpA y -10% Atk — la nature por defecto de sweepers especiales.',
    category: 'stats',
  },
  {
    q: '¿Cuántos EVs máximo puede tener un Pokémon en TOTAL?',
    options: ['508', '510', '512', '600'],
    correctIndex: 1,
    explain: '510 EVs en total, máximo 252 en una sola stat (los últimos 2 se desperdician → 508 efectivos).',
    category: 'stats',
  },
  {
    q: '¿Cuál es la única forma de obtener IVs perfectos en SV?',
    options: [
      'Hyper Training (BP)',
      'Vitaminas',
      'Sólo eclosionando',
      'Berries especiales',
    ],
    correctIndex: 0,
    explain: 'Hyper Training en Montenevera permite maximizar IVs a 31 usando Bottle Caps.',
    category: 'meta',
  },
  {
    q: '¿Qué ítem activa Booster Energy?',
    options: [
      'Solo Paradox Pokémon',
      'Cualquier Pokémon eléctrico',
      'Cualquier Pokémon en sol',
      'Solo Iron-line',
    ],
    correctIndex: 0,
    explain: 'Booster Energy activa Protosynthesis (pasado) o Quark Drive (futuro) sin necesitar weather/terrain.',
    category: 'meta',
  },
  {
    q: '¿Qué move tiene 120 BP y 100% accuracy en Gen 9 SV?',
    options: ['Earthquake', 'Close Combat', 'Earth Power', 'Stone Edge'],
    correctIndex: 1,
    explain: 'Close Combat es 120 BP / 100% acc / -1 Def/SpD self. Earthquake es solo 100 BP.',
    category: 'mecanicas',
  },
  {
    q: '¿Cuántos Pokémon hay en total en Gen 9 (incluyendo DLC)?',
    options: ['1017', '1025', '1010', '1009'],
    correctIndex: 1,
    explain: 'Gen 9 Scarlet/Violet + DLC Teal Mask + Indigo Disk = 1025 Pokémon en total.',
    category: 'meta',
  },
];

/** Selecciona N preguntas determinísticamente para una fecha dada (sin repetir) */
export function dailyTriviaQuestions(dateISO: string, count = 5): TriviaQuestion[] {
  // Seed
  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) | 0;
  }
  let seed = Math.abs(hash);

  // Fisher-Yates determinista
  const pool = [...TRIVIA_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
