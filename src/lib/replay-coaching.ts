// Heurísticas de coaching para replays parseados.
//
// No es IA. Son detectores de patrones obvios — situaciones donde un
// jugador deja momentum / damage / partida sin explotarlo. Útil para
// principiantes/intermedios que quieren aprender qué hacen mal sin
// pagar a un coach.

import type { ReplayAnalysis, ReplayEvent, ReplayPlayer } from './replay-parser';

export interface CoachingTip {
  /** A quién va dirigido el tip — p1 / p2 / both / general */
  player: 'p1' | 'p2' | 'both' | 'general';
  /** Severidad — 'info' es observación, 'warning' es error táctico, 'critical' es punto de partida perdida */
  severity: 'info' | 'warning' | 'critical';
  /** Turno donde se detectó (si aplica) */
  turn?: number;
  /** Mensaje breve, accionable */
  title: string;
  /** Detalle / explicación del por qué */
  detail: string;
  /** Categoría — para agrupar en UI */
  category: 'hazards' | 'switching' | 'tera' | 'momentum' | 'sleep' | 'general';
}

const HAZARD_MOVES = ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'];
const HAZARD_REMOVAL = ['Rapid Spin', 'Defog', 'Court Change', 'Tidy Up', 'Mortal Spin'];

/** Devuelve tips ordenados por turno + severidad. Max ~6 tips para no abrumar. */
export function analyzeForCoaching(analysis: ReplayAnalysis): CoachingTip[] {
  const tips: CoachingTip[] = [];

  // 1. ¿Alguien NO usó hazards en una partida >10 turnos?
  const usedHazards = {
    p1: hasMoveUsed(analysis.events, 'p1', HAZARD_MOVES),
    p2: hasMoveUsed(analysis.events, 'p2', HAZARD_MOVES),
  };
  if (analysis.turnCount >= 10) {
    if (!usedHazards.p1) {
      tips.push({
        player: 'p1',
        severity: 'warning',
        title: 'No usaste hazards',
        detail:
          'En partidas de >10 turnos, hazards (Stealth Rock / Spikes) son chip damage gratis. Considera meter un hazard setter en tu próximo equipo.',
        category: 'hazards',
      });
    }
    if (!usedHazards.p2) {
      tips.push({
        player: 'p2',
        severity: 'warning',
        title: 'No usaste hazards',
        detail:
          'En partidas de >10 turnos, hazards (Stealth Rock / Spikes) son chip damage gratis. Considera meter un hazard setter en tu próximo equipo.',
        category: 'hazards',
      });
    }
  }

  // 2. ¿Alguien usó hazards pero el rival NO los limpió?
  for (const slot of ['p1', 'p2'] as const) {
    const other = slot === 'p1' ? 'p2' : 'p1';
    if (usedHazards[slot] && !hasMoveUsed(analysis.events, other, HAZARD_REMOVAL)) {
      tips.push({
        player: other,
        severity: 'warning',
        title: 'No limpiaste hazards del rival',
        detail:
          'Tu rival puso Stealth Rock / Spikes y nunca usaste Rapid Spin, Defog o Tidy Up. Cada switch te costaba %HP gratis. Considera añadir un hazard remover.',
        category: 'hazards',
      });
    }
  }

  // 3. Switches excesivos en un solo turno (pivoting infinito → predict barato)
  const switchesByTurn: Record<number, { p1: number; p2: number }> = {};
  for (const ev of analysis.events) {
    if (ev.kind !== 'switch') continue;
    const slot = inferSlotFromActor(ev, analysis.players);
    if (!slot) continue;
    if (!switchesByTurn[ev.turn]) switchesByTurn[ev.turn] = { p1: 0, p2: 0 };
    switchesByTurn[ev.turn][slot]++;
  }
  // Detectar 3+ switches del mismo player en partidas cortas (indica pánico)
  const totalSwitches = { p1: 0, p2: 0 };
  for (const turn of Object.values(switchesByTurn)) {
    totalSwitches.p1 += turn.p1;
    totalSwitches.p2 += turn.p2;
  }
  if (analysis.turnCount > 0) {
    const switchRate = (p: 'p1' | 'p2') =>
      totalSwitches[p] / analysis.turnCount;
    for (const p of ['p1', 'p2'] as const) {
      if (switchRate(p) > 0.5 && totalSwitches[p] >= 5) {
        tips.push({
          player: p,
          severity: 'info',
          title: `Muchos switches (${totalSwitches[p]})`,
          detail:
            'Cambiaste de Pokémon en más del 50% de los turnos. Aunque pivotar bien es clave, demasiados switches indican que no tienes un win-condition claro o que estás siendo predecible. Intenta planificar tu sweep con más antelación.',
          category: 'switching',
        });
      }
    }
  }

  // 4. Tera usado en el primer turno (probablemente desperdiciado)
  const teraEvents = analysis.events.filter((e) => e.kind === 'tera');
  for (const tera of teraEvents) {
    if (tera.turn === 1) {
      const slot = inferSlotFromActor(tera, analysis.players);
      if (slot) {
        tips.push({
          player: slot,
          severity: 'critical',
          turn: 1,
          title: 'Tera usado en turno 1',
          detail:
            'Activar Tera en el primer turno es casi siempre una decisión panic — pierdes flexibilidad para el resto de la partida. Tera funciona mejor reservado para tu win-condition (sweeper en setup o pivot que necesita resistir un hit clave).',
          category: 'tera',
        });
      }
    }
  }

  // 5. Tera nunca usado (en partidas >15 turnos)
  if (analysis.turnCount >= 15) {
    for (const p of ['p1', 'p2'] as const) {
      const teraByPlayer = teraEvents.filter(
        (e) => inferSlotFromActor(e, analysis.players) === p
      );
      if (teraByPlayer.length === 0) {
        tips.push({
          player: p,
          severity: 'warning',
          title: 'No usaste Tera',
          detail:
            'En una partida larga, Tera sin usar es daño/utility desperdiciado. Reserva Tera para tu win-con o un switch crítico — pero úsalo siempre antes de que tu equipo caiga.',
          category: 'tera',
        });
      }
    }
  }

  // 6. Primer KO temprano (turno ≤ 4) — indica error grave del que perdió
  if (analysis.faintedFirst && analysis.faintedFirst.turn <= 4) {
    tips.push({
      player: analysis.faintedFirst.player,
      severity: 'critical',
      turn: analysis.faintedFirst.turn,
      title: `KO temprano (turno ${analysis.faintedFirst.turn})`,
      detail: `Perdiste a ${analysis.faintedFirst.pokemon} antes del turno 5. Esto suele indicar un matchup mal escogido en el lead o no preveer el move del rival. Estudia el matchup theory de tu equipo contra arquetipos comunes.`,
      category: 'momentum',
    });
  }

  // 7. Ratio de KOs muy desigual (3+ vs <1 KO) sugiere asimetría táctica
  const koDiff = Math.abs(analysis.kosByPlayer.p1 - analysis.kosByPlayer.p2);
  if (koDiff >= 3) {
    const loser =
      analysis.kosByPlayer.p1 < analysis.kosByPlayer.p2 ? 'p1' : 'p2';
    tips.push({
      player: loser,
      severity: 'warning',
      title: `Ratio de KOs adverso (${analysis.kosByPlayer.p1}-${analysis.kosByPlayer.p2})`,
      detail:
        'Tu rival hizo 3+ KOs más que tú. Revisa qué Pokémon tuyos cayeron sin trade y por qué — suele ser un type matchup ignorado o una predicción equivocada.',
      category: 'momentum',
    });
  }

  // 8. Status moves repetidos (Toxic spam vs el mismo Pokémon) — info
  // (Lo dejamos fuera del v1 para no saturar)

  // Ordenar: critical > warning > info, luego por turno
  tips.sort((a, b) => {
    const sev = { critical: 0, warning: 1, info: 2 };
    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
    return (a.turn ?? 0) - (b.turn ?? 0);
  });

  return tips.slice(0, 8);
}

function hasMoveUsed(
  events: ReplayEvent[],
  slot: 'p1' | 'p2',
  moveNames: string[]
): boolean {
  return events.some(
    (e) =>
      e.kind === 'move' &&
      e.detail &&
      moveNames.includes(e.detail) &&
      e.actor?.startsWith(slot)
  );
}

function inferSlotFromActor(
  ev: ReplayEvent,
  players: readonly [ReplayPlayer, ReplayPlayer]
): 'p1' | 'p2' | null {
  if (!ev.actor) return null;
  // El actor suele ser tipo "p1a: Garchomp"
  const match = ev.actor.match(/^(p[12])/);
  if (match) return match[1] as 'p1' | 'p2';
  // Si no, intentar match por nombre del team
  for (const player of players) {
    if (player.team.some((m) => m.species === ev.actor || m.nick === ev.actor)) {
      return player.slot;
    }
  }
  return null;
}
