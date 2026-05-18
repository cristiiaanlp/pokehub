import Link from 'next/link';
import { getUsageStats, SMOGON_FORMATS } from '@/lib/meta/smogon';
import { resolveSmogonNameAsync } from '@/lib/meta/name-resolver';
import { UsageTable, type UsageRow } from '@/components/meta/UsageTable';
import {
  FireIcon,
  TrendingUpIcon,
  BoltIcon,
  GamepadIcon,
  ArrowRight,
  SparklesIcon,
  TrophyIcon,
} from '@/components/ui/Icon';
import { CHAMPIONS_TOP_USAGE } from '@/lib/champions/data';
import { artworkFor } from '@/lib/pokeapi';
import { resolveSmogonName } from '@/lib/meta/name-resolver';

export const revalidate = 86400; // 24h

interface Props {
  searchParams: { format?: string };
}

export default async function MetaPage({ searchParams }: Props) {
  const formatId = SMOGON_FORMATS.find((f) => f.id === searchParams.format)?.id ?? 'gen9ou';
  const formatMeta = SMOGON_FORMATS.find((f) => f.id === formatId)!;
  const stats = await getUsageStats(formatId, 1500);

  const top = stats?.entries.slice(0, 20) ?? [];
  const resolved = await Promise.all(
    top.map(async (e) => ({
      rank: e.rank,
      name: e.name,
      usagePct: e.usagePct,
      speciesId: await resolveSmogonNameAsync(e.name),
    }))
  );
  const rows: UsageRow[] = resolved;

  const championsTopWithIds = CHAMPIONS_TOP_USAGE.slice(0, 6).map((u) => ({
    ...u,
    speciesId: resolveSmogonName(u.name),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-accent-yellow/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full bg-accent-red/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-accent-yellow/15 text-accent-yellow text-xs font-bold tracking-widest uppercase mb-3">
            <TrendingUpIcon className="w-3.5 h-3.5" />
            Meta Hub · DATOS REALES
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            El <span className="gradient-text">pulso</span> del meta competitivo
          </h1>
          <p className="text-ink-soft mt-3 text-lg max-w-2xl">
            Usage stats reales de Smogon{stats?.month ? ` · ${stats.month}` : ''}.
            Auto-actualizado cada 24h. Pokémon Champions y SV Singles/Doubles.
          </p>
        </div>
      </div>

      {/* Pokémon Champions teaser */}
      <Link
        href="/meta/champions"
        className="block relative overflow-hidden rounded-2xl border border-accent-red/30 hover:border-accent-red/50 transition-colors p-6 sm:p-7 group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-red/20 via-orange-500/10 to-accent-yellow/10" />
        <div className="absolute -top-16 -right-12 w-60 h-60 rounded-full bg-accent-red/20 blur-3xl" />
        <div className="absolute right-4 bottom-2 flex -space-x-4 opacity-80">
          {championsTopWithIds.slice(0, 3).map(
            (p) =>
              p.speciesId && (
                <img
                  key={p.name}
                  src={artworkFor(p.speciesId)}
                  alt={p.name}
                  className="w-24 h-24 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                />
              )
          )}
        </div>
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent-red font-bold mb-2">
            <GamepadIcon className="w-3.5 h-3.5" />
            Pokémon Champions · Reg M-A
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            El nuevo juego competitivo oficial
          </h2>
          <p className="text-ink-soft mt-2 text-sm sm:text-base">
            Salió 8 abril 2026. Mega Evolutions legales. Stats actuales,
            equipos top, core pairs y calendario de torneos.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-red group-hover:gap-3 transition-all">
            Ver hub Champions
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Format selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="text-xs uppercase tracking-widest text-ink-faint font-semibold mr-2">
          Formato:
        </div>
        {SMOGON_FORMATS.map((f) => (
          <Link
            key={f.id}
            href={`/meta?format=${f.id}`}
            className={`h-8 px-3 inline-flex items-center rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
              f.id === formatId
                ? 'bg-ink text-bg-950'
                : 'glass text-ink-soft hover:text-ink'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Top Usage */}
        <div className="lg:col-span-2">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-accent-red" />
              Top Usage · {formatMeta.label}
            </h2>
            <div className="text-xs text-ink-faint">
              {stats
                ? `${stats.totalBattles.toLocaleString()} battles · ELO 1500+`
                : 'Sin datos disponibles'}
            </div>
          </div>
          {rows.length === 0 ? (
            <div className="card-base p-10 text-center text-ink-dim">
              No se pudo obtener stats para este formato ahora mismo.
              <br />
              Intenta otro formato o vuelve en unos minutos.
            </div>
          ) : (
            <UsageTable rows={rows} />
          )}
        </div>

        {/* Side info */}
        <div className="space-y-4">
          <div className="card-base p-5">
            <h3 className="font-display text-base font-bold mb-2 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-accent-yellow" />
              {formatMeta.label}
            </h3>
            <p className="text-sm text-ink-dim leading-relaxed">
              {formatMeta.description}
            </p>
            {stats && (
              <div className="mt-3 pt-3 border-t border-white/[0.05] grid grid-cols-2 gap-2 text-xs">
                <Stat label="Mes" value={stats.month} />
                <Stat label="ELO" value="1500+" />
                <Stat
                  label="Battles"
                  value={
                    stats.totalBattles >= 1000
                      ? `${(stats.totalBattles / 1000).toFixed(0)}k`
                      : String(stats.totalBattles)
                  }
                />
                <Stat label="Tracked" value={String(stats.entries.length)} />
              </div>
            )}
          </div>

          <Link
            href="/meta/teams"
            className="block card-base card-hover p-5 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/15 text-brand-glow flex items-center justify-center">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold">Equipos top</div>
                <div className="text-xs text-ink-dim">
                  Teams reales de torneos
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <div className="card-base p-5">
            <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
              <BoltIcon className="w-4 h-4 text-brand-glow" />
              Champions Top 6
            </h3>
            <div className="space-y-1.5">
              {championsTopWithIds.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-2.5 p-2 rounded-lg glass text-sm"
                >
                  {p.speciesId ? (
                    <img
                      src={artworkFor(p.speciesId)}
                      alt={p.name}
                      className="w-7 h-7 object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-white/[0.04] shrink-0" />
                  )}
                  <span className="flex-1 truncate font-semibold">{p.name}</span>
                  <span className="text-xs font-mono text-ink-dim tabular-nums">
                    {p.usagePct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/meta/champions"
              className="block text-center mt-3 text-xs font-semibold text-accent-red hover:text-accent-red/80"
            >
              Ver Champions hub →
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-ink-faint pt-4">
        Fuentes: Smogon.com (usage stats), ChampionsMeta, Pikalytics. Datos
        actualizados cada 24h vía Next.js ISR.
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-ink-faint">
        {label}
      </div>
      <div className="font-mono font-bold text-ink">{value}</div>
    </div>
  );
}
