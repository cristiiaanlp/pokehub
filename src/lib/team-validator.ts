// Validador de equipos contra reglas de formato.
// Recibe SavedTeam + format ID, devuelve lista de violaciones.

import type { SavedTeam } from '@/stores/teamStore';
import type { PokemonType } from '@/types/pokemon';
import { getFormat } from './formats';

export type ViolationSeverity = 'error' | 'warning';

export interface Violation {
  severity: ViolationSeverity;
  message: string;
  memberIndex?: number; // si la violación es de un miembro concreto
}

export interface ValidationResult {
  ok: boolean;
  errors: Violation[];
  warnings: Violation[];
}

export function validateTeam(team: SavedTeam, formatId: string): ValidationResult {
  const format = getFormat(formatId);
  const errors: Violation[] = [];
  const warnings: Violation[] = [];

  if (!format) {
    errors.push({ severity: 'error', message: `Formato desconocido: ${formatId}` });
    return { ok: false, errors, warnings };
  }

  // Tamaño
  const size = team.members.length;
  if (size < format.teamSize.min) {
    errors.push({
      severity: 'error',
      message: `Faltan Pokémon: tienes ${size}, mínimo ${format.teamSize.min} para ${format.name}.`,
    });
  }
  if (size > format.teamSize.max) {
    errors.push({
      severity: 'error',
      message: `Demasiados Pokémon: tienes ${size}, máximo ${format.teamSize.max}.`,
    });
  }

  // Por miembro
  let restrictedCount = 0;
  const speciesSeen = new Map<number, number>();
  const itemsSeen = new Map<string, number>();

  team.members.forEach((m, idx) => {
    // Banlist
    if (format.banned.includes(m.pokemonId)) {
      errors.push({
        severity: 'error',
        message: `${m.name} (#${m.pokemonId}) está prohibido en ${format.name}.`,
        memberIndex: idx,
      });
    }

    // Restricted (sólo cuenta si la regla existe)
    if (format.restricted?.includes(m.pokemonId)) {
      restrictedCount++;
    }

    // Species clause
    if (format.speciesClause) {
      speciesSeen.set(m.pokemonId, (speciesSeen.get(m.pokemonId) ?? 0) + 1);
    }

    // Item clause
    if (format.itemClause && m.item) {
      const key = m.item.toLowerCase();
      itemsSeen.set(key, (itemsSeen.get(key) ?? 0) + 1);
    }

    // Nivel — solo warning si no coincide
    if (m.level && m.level !== format.level) {
      warnings.push({
        severity: 'warning',
        message: `${m.name} está a nivel ${m.level}, ${format.name} fuerza nivel ${format.level}.`,
        memberIndex: idx,
      });
    }

    // Sets incompletos
    if (!m.moves || m.moves.length === 0) {
      warnings.push({
        severity: 'warning',
        message: `${m.name} no tiene movimientos asignados.`,
        memberIndex: idx,
      });
    } else if (m.moves.length < 4) {
      warnings.push({
        severity: 'warning',
        message: `${m.name} solo tiene ${m.moves.length}/4 movimientos.`,
        memberIndex: idx,
      });
    }
    if (!m.ability) {
      warnings.push({
        severity: 'warning',
        message: `${m.name} no tiene habilidad asignada.`,
        memberIndex: idx,
      });
    }
    if (!m.item && format.itemClause) {
      warnings.push({
        severity: 'warning',
        message: `${m.name} no tiene item asignado (item clause en este formato).`,
        memberIndex: idx,
      });
    }
  });

  // Validaciones agregadas
  if (format.maxRestricted !== undefined && restrictedCount > format.maxRestricted) {
    errors.push({
      severity: 'error',
      message: `Demasiados Pokémon restringidos: ${restrictedCount}/${format.maxRestricted}.`,
    });
  }

  if (format.speciesClause) {
    for (const [id, count] of speciesSeen.entries()) {
      if (count > 1) {
        const m = team.members.find((x) => x.pokemonId === id)!;
        errors.push({
          severity: 'error',
          message: `Species clause: ${m.name} aparece ${count} veces. Solo 1 por equipo.`,
        });
      }
    }
  }

  if (format.itemClause) {
    for (const [item, count] of itemsSeen.entries()) {
      if (count > 1) {
        errors.push({
          severity: 'error',
          message: `Item clause: "${item}" aparece ${count} veces.`,
        });
      }
    }
  }

  // Monotype: todos comparten un tipo
  if (formatId === 'monotype' && team.members.length > 1) {
    const sharedTypes = team.members.reduce<Set<PokemonType>>((acc, m, idx) => {
      const memberTypes = new Set(m.types);
      if (idx === 0) return memberTypes;
      return new Set([...acc].filter((t) => memberTypes.has(t)));
    }, new Set());
    if (sharedTypes.size === 0) {
      errors.push({
        severity: 'error',
        message:
          'Monotype: no todos los Pokémon comparten un tipo común. Asegúrate de que al menos un tipo está presente en TODOS.',
      });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
