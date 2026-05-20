'use client';

import { useState } from 'react';
import { useTeamStore } from '@/stores/teamStore';
import { parseShowdown, exportShowdown } from '@/lib/showdown';
import { getPokemon, spriteFor } from '@/lib/pokeapi';
import type { TeamMember } from '@/types/pokemon';
import { CheckIcon, ArrowRight } from '@/components/ui/Icon';

// Slugify species para PokéAPI: "Tornadus-Therian" → "tornadus-therian"
function speciesToSlug(species: string): string {
  return species
    .toLowerCase()
    .replace(/[.']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function ShowdownIO() {
  const team = useTeamStore((s) => s.current);
  const setSlot = useTeamStore((s) => s.setSlot);
  const clearTeam = useTeamStore((s) => s.clearTeam);

  const [mode, setMode] = useState<'import' | 'export'>('import');
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const exportedText = mode === 'export'
    ? exportShowdown(team.filter(Boolean) as TeamMember[])
    : '';

  const doImport = async () => {
    if (!text.trim()) return;
    setImporting(true);
    setReport(null);
    try {
      const { members, errors } = parseShowdown(text);
      if (members.length === 0) {
        setReport('No se pudo extraer ningún Pokémon del texto pegado.');
        return;
      }

      const resolved: (TeamMember | null)[] = [null, null, null, null, null, null];
      const notFound: string[] = [];
      let slotIdx = 0;

      for (const m of members.slice(0, 6)) {
        const slug = speciesToSlug(m.species);
        try {
          const detail = await getPokemon(slug);
          const newMember: TeamMember = {
            pokemonId: detail.id,
            name: detail.name,
            sprite: spriteFor(detail.id),
            types: detail.types,
            stats: detail.stats,
            abilities: detail.abilities,
            ability: m.ability,
            item: m.item,
            nature: m.nature,
            moves: m.moves,
            evs: m.evs as TeamMember['evs'],
            ivs: m.ivs as TeamMember['ivs'],
            level: m.level,
            shiny: m.shiny,
            nickname: m.nickname,
          };
          resolved[slotIdx] = newMember;
          slotIdx++;
        } catch {
          notFound.push(m.species);
        }
      }

      // Reemplaza el equipo entero
      clearTeam();
      resolved.forEach((member, idx) => {
        if (member) setSlot(idx, member);
      });

      const parts: string[] = [
        `✓ Importados ${resolved.filter(Boolean).length}/${members.length} Pokémon.`,
      ];
      if (notFound.length > 0) {
        parts.push(`Especies no encontradas: ${notFound.join(', ')}.`);
      }
      if (errors.length > 0) {
        parts.push(`Avisos: ${errors.join('; ')}.`);
      }
      setReport(parts.join(' '));
      setText('');
    } finally {
      setImporting(false);
    }
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: selecciona el textarea */
    }
  };

  const filledSlots = team.filter(Boolean).length;

  return (
    <div className="card-base p-5 space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          ⇄ Showdown Import / Export
        </h3>
        <p className="text-xs text-ink-dim mt-1">
          Pega o copia equipos en formato de Pokémon Showdown. Compatible con
          export desde Showdown teambuilder, Smogon analyses y herramientas
          tipo Pokémon Showdown Damage Calc.
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setMode('import')}
          className={`h-8 px-3 rounded-md text-xs font-bold uppercase tracking-wide ${
            mode === 'import'
              ? 'bg-brand text-white'
              : 'glass text-ink-soft hover:text-ink'
          }`}
        >
          Importar
        </button>
        <button
          onClick={() => setMode('export')}
          disabled={filledSlots === 0}
          className={`h-8 px-3 rounded-md text-xs font-bold uppercase tracking-wide disabled:opacity-50 ${
            mode === 'export'
              ? 'bg-brand text-white'
              : 'glass text-ink-soft hover:text-ink'
          }`}
        >
          Exportar ({filledSlots})
        </button>
      </div>

      {mode === 'import' ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder={`Pega aquí un team Showdown.\n\nEjemplo:\nGarchomp @ Choice Scarf\nAbility: Rough Skin\nTera Type: Steel\nEVs: 4 HP / 252 Atk / 252 Spe\nJolly Nature\n- Earthquake\n- Dragon Claw\n- Stone Edge\n- Outrage`}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-mono resize-y"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] text-ink-faint">
              ⚠ Reemplaza tu equipo actual. Si tienes algo importante, expórtalo
              primero.
            </p>
            <button
              onClick={doImport}
              disabled={importing || !text.trim()}
              className="h-9 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {importing ? 'Importando…' : 'Importar equipo'}
              {!importing && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
          {report && (
            <div className="card-base p-3 text-xs bg-white/[0.02] border-white/[0.06]">
              {report}
            </div>
          )}
        </>
      ) : (
        <>
          <textarea
            value={exportedText}
            readOnly
            rows={Math.max(10, exportedText.split('\n').length + 1)}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-mono resize-y"
          />
          <div className="flex items-center justify-end gap-2">
            <a
              href="https://play.pokemonshowdown.com/teambuilder"
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-brand-glow hover:text-brand-hover"
            >
              Abrir Showdown Teambuilder ↗
            </a>
            <button
              onClick={copyExport}
              className="h-9 px-4 rounded-lg bg-accent-green/15 text-accent-green text-xs font-bold uppercase tracking-widest hover:bg-accent-green/25 inline-flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  Copiado
                </>
              ) : (
                'Copiar al portapapeles'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
