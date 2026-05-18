import type { EnrichedPikalyticsData } from '@/lib/pikalytics/enrich';
import { artworkFor } from '@/lib/pokeapi';
import { LiveBadge } from '@/components/meta/LiveBadge';
import Link from 'next/link';
import { TeamCard } from '@/components/meta/TeamCard';

interface Props {
  data: EnrichedPikalyticsData;
  pokemonName: string;
  fetchedAt: string;
  formatLabel: string;
}

export function LivePikalyticsData({
  data,
  pokemonName,
  fetchedAt,
  formatLabel,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <LiveBadge
          source={`Pikalytics · ${formatLabel}`}
          dataDate={data.dataDate || undefined}
          fetchedAt={fetchedAt}
        />
        <span className="text-xs text-ink-faint">
          Datos en vivo del ladder competitivo
        </span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <UsageColumn title="Top moves" rows={data.moves.slice(0, 6)} />
        <UsageColumn
          title="Top items"
          rows={data.items.slice(0, 6)}
          accent="text-accent-yellow"
        />
        <UsageColumn
          title="Top habilidades"
          rows={data.abilities.slice(0, 6)}
          accent="text-brand-glow"
        />
        <PartnerColumn rows={data.teammates.slice(0, 6)} />
      </div>

      {data.teams.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-base font-bold">
            Equipos del ladder con {pokemonName}
          </h3>
          {data.teams.slice(0, 5).map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function UsageColumn({
  title,
  rows,
  accent = 'text-ink',
}: {
  title: string;
  rows: { name: string; usagePct: number }[];
  accent?: string;
}) {
  return (
    <div className="card-base p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-3">
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="text-xs text-ink-dim">Sin datos.</div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.name} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className={`truncate ${accent}`}>{r.name}</span>
                <span className="font-mono text-ink-faint tabular-nums shrink-0">
                  {r.usagePct.toFixed(1)}%
                </span>
              </div>
              <div className="h-1 mt-1 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-brand-glow"
                  style={{ width: `${Math.min(r.usagePct * 3, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PartnerColumn({
  rows,
}: {
  rows: { name: string; usagePct: number; speciesId: number | null }[];
}) {
  return (
    <div className="card-base p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-3">
        Top compañeros
      </div>
      {rows.length === 0 ? (
        <div className="text-xs text-ink-dim">Sin datos.</div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-2 p-1.5 rounded-md glass hover:bg-white/[0.06] transition-colors"
            >
              {r.speciesId ? (
                <Link href={`/pokedex/${r.speciesId}`} className="shrink-0">
                  <img
                    src={artworkFor(r.speciesId)}
                    alt={r.name}
                    className="w-8 h-8 object-contain"
                    loading="lazy"
                  />
                </Link>
              ) : (
                <div className="w-8 h-8 rounded-md bg-white/[0.04] shrink-0" />
              )}
              <span className="flex-1 text-sm truncate">{r.name}</span>
              <span className="font-mono text-xs text-ink-faint tabular-nums">
                {r.usagePct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
