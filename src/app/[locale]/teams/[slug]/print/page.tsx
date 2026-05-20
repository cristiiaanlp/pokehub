'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPublicTeamBySlug } from '@/lib/sync/cloud';
import type { SavedTeam } from '@/stores/teamStore';
import { artworkFor } from '@/lib/pokeapi';
import { Link } from '@/i18n/routing';

export default function PrintTeamSheet() {
  const params = useParams<{ slug: string }>();
  const [team, setTeam] = useState<SavedTeam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicTeamBySlug(params.slug).then((t) => {
      setTeam(t);
      setLoading(false);
    });
  }, [params.slug]);

  if (loading) {
    return (
      <div className="p-10 text-center text-ink-dim">Cargando equipo…</div>
    );
  }

  if (!team) {
    return (
      <div className="p-10 text-center">
        <h1 className="font-display text-2xl font-bold">Equipo no encontrado</h1>
        <Link href="/team-builder" className="text-brand-glow underline mt-2 block">
          Volver al Team Builder
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Estilos @print en línea para limitar scope */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print-hide { display: none !important; }
          .print-sheet { box-shadow: none !important; border: 1px solid #ddd !important; }
          .print-sheet img { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .page-break { page-break-after: always; }
          @page { margin: 1.2cm; }
        }
      `}</style>

      <div className="print-container mx-auto max-w-4xl px-4 py-6 print:p-0">
        {/* Controles - hidden en print */}
        <div className="print-hide mb-6 card-base p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-brand-glow font-bold">
              Hoja de equipo imprimible
            </div>
            <h1 className="font-display text-xl font-bold mt-0.5">{team.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="h-10 px-4 rounded-xl bg-brand text-white text-sm font-bold shadow-glow hover:bg-brand-hover inline-flex items-center gap-1.5"
            >
              🖨️ Imprimir / PDF
            </button>
            <Link
              href={`/teams/${team.shareSlug ?? params.slug}`}
              className="h-10 px-4 rounded-xl glass text-sm font-semibold inline-flex items-center"
            >
              ← Volver
            </Link>
          </div>
        </div>

        {/* Print layout */}
        <div className="print-sheet bg-white text-black rounded-xl p-6 shadow-lg space-y-4">
          {/* Header */}
          <div className="flex items-baseline justify-between border-b-2 border-gray-300 pb-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#0b0f17' }}>
                {team.name}
              </h2>
              <div className="text-xs text-gray-500 mt-0.5">
                {team.format ?? 'Equipo competitivo'} ·{' '}
                {team.members.length} Pokémon
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">PokéHub.app</div>
              <div className="text-[10px] text-gray-400 font-mono">
                {new Date(team.updatedAt).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>

          {/* Grid de Pokémon */}
          <div className="grid grid-cols-2 gap-3">
            {team.members.map((m, i) => (
              <div
                key={`${m.pokemonId}-${i}`}
                className="border border-gray-300 rounded-lg p-3 break-inside-avoid"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={artworkFor(m.pokemonId)}
                    alt={m.name}
                    width={70}
                    height={70}
                    className="object-contain shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base capitalize" style={{ color: '#0b0f17' }}>
                      {m.nickname && m.nickname !== m.name
                        ? `${m.nickname} (${m.name})`
                        : m.name}
                    </div>
                    {m.item && (
                      <div className="text-xs text-gray-600 mt-0.5">
                        @ <strong>{m.item}</strong>
                      </div>
                    )}
                    {m.ability && (
                      <div className="text-xs text-gray-600">
                        Ability: <strong>{m.ability}</strong>
                      </div>
                    )}
                    {m.nature && (
                      <div className="text-xs text-gray-600">
                        {m.nature} Nature
                      </div>
                    )}
                  </div>
                </div>

                {/* EVs */}
                {m.evs && Object.keys(m.evs).length > 0 && (
                  <div className="mt-2 text-[10px] text-gray-700 font-mono">
                    <span className="font-bold uppercase tracking-widest text-gray-500">
                      EVs:{' '}
                    </span>
                    {formatEvs(m.evs as unknown as Record<string, number>)}
                  </div>
                )}

                {/* Moves */}
                {m.moves && m.moves.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {m.moves.map((mv, j) => (
                      <div
                        key={`${mv}-${j}`}
                        className="text-[11px] px-2 py-1 rounded bg-gray-100 border border-gray-200"
                      >
                        - {mv}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-[10px] text-gray-400 text-center pt-3 border-t border-gray-200">
            Generado en PokéHub.app · {new Date().toLocaleDateString('es-ES')}
          </div>
        </div>
      </div>
    </>
  );
}

function formatEvs(evs: Record<string, number> | Partial<Record<string, number>>): string {
  const labels: Record<string, string> = {
    hp: 'HP',
    attack: 'Atk',
    defense: 'Def',
    specialAttack: 'SpA',
    specialDefense: 'SpD',
    speed: 'Spe',
  };
  return Object.entries(evs as Record<string, number | undefined>)
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([k, v]) => `${v} ${labels[k] ?? k}`)
    .join(' / ');
}
