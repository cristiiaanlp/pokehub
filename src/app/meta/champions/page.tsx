import Link from 'next/link';
import { artworkFor } from '@/lib/pokeapi';
import { resolveSmogonName } from '@/lib/meta/name-resolver';
import {
  CHAMPIONS_FORMAT,
  CHAMPIONS_TOP_USAGE,
  CHAMPIONS_CORE_PAIRS,
  CHAMPIONS_SAMPLE_TEAMS,
  CHAMPIONS_UPCOMING,
} from '@/lib/champions/data';
import { TeamCard } from '@/components/meta/TeamCard';
import { LiveBadge } from '@/components/meta/LiveBadge';
import { getLiveChampionsMeta } from '@/lib/pikalytics/aggregate';
import { liveTeamToSampleTeam } from '@/lib/pikalytics/adapter';
import {
  GamepadIcon,
  FireIcon,
  TrendingUpIcon,
  TrophyIcon,
  ClockIcon,
  SparklesIcon,
} from '@/components/ui/Icon';

export const revalidate = 86400; // 24h

export const metadata = {
  title: 'Pokémon Champions · Meta · PokéHub',
  description:
    'Reg M-A: usage stats reales, equipos top de ladder y torneos, core pairs y calendario de Pokémon Champions.',
};

const PIVOT_POKEMON = [
  'Incineroar',
  'Sneasler',
  'Garchomp',
  'Kingambit',
  'Charizard',
  'Whimsicott',
];

export default async function ChampionsPage() {
  const live = await getLiveChampionsMeta({
    format: 'championspreview',
    pivotPokemon: PIVOT_POKEMON,
    maxTeams: 8,
  });

  // Choose data sources with fallback
  const sampleTeams = live
    ? live.topTeams.slice(0, 6).map((t) => liveTeamToSampleTeam(t))
    : CHAMPIONS_SAMPLE_TEAMS;

  const usageWithIds = CHAMPIONS_TOP_USAGE.map((u) => ({
    ...u,
    speciesId: resolveSmogonName(u.name),
  }));

  const coreWithIds = CHAMPIONS_CORE_PAIRS.map((c) => ({
    ...c,
    aId: resolveSmogonName(c.pokemonA),
    bId: resolveSmogonName(c.pokemonB),
  }));

  // Live teammate aggregation pre-resolves species IDs server-side
  const livePartners = live ? live.topTeammates.slice(0, 8) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-12">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent-red/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent-yellow/15 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-accent-red/20 text-accent-red text-xs font-bold tracking-widest uppercase">
              <GamepadIcon className="w-3.5 h-3.5" />
              Pokémon Champions
            </div>
            {live && (
              <LiveBadge
                source="Pikalytics"
                dataDate={live.dataDate || undefined}
                fetchedAt={live.fetchedAt}
              />
            )}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            El nuevo <span className="gradient-text">battle game</span>
            <br className="hidden sm:block" /> oficial competitivo
          </h1>
          <p className="text-ink-soft mt-4 text-lg max-w-2xl">
            Salió el 8 de abril 2026 en Nintendo Switch. Reg M-A activo: Mega
            Evolutions legales, Paradox y Treasures of Ruin baneados.
            {live ? (
              <>
                {' '}
                Datos actualizados de{' '}
                <span className="text-ink font-bold">
                  {live.sourceCount}
                </span>{' '}
                fuentes Pikalytics{live.dataDate ? ` (${live.dataDate})` : ''}.
              </>
            ) : (
              <>
                {' '}
                Más de{' '}
                <span className="text-ink font-bold">
                  {CHAMPIONS_FORMAT.sampleSize.toLocaleString()}
                </span>{' '}
                equipos analizados.
              </>
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {CHAMPIONS_FORMAT.rules.map((r) => (
              <span
                key={r}
                className="text-xs px-3 h-7 inline-flex items-center rounded-md glass text-ink-soft"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top usage + Core pairs */}
      <div className="grid lg:grid-cols-2 gap-5">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-accent-red" />
              Top Usage
            </h2>
            <span className="text-xs text-ink-faint">Reg M-A actual</span>
          </div>
          <div className="card-base p-3 space-y-1.5">
            {usageWithIds.map((u, i) => (
              <div
                key={u.name}
                className="flex items-center gap-3 p-2.5 rounded-xl glass"
              >
                <div className="w-6 text-center font-mono font-bold text-ink-faint text-xs">
                  {String(i + 1).padStart(2, '0')}
                </div>
                {u.speciesId ? (
                  <Link href={`/pokedex/${u.speciesId}`} className="shrink-0">
                    <img
                      src={artworkFor(u.speciesId)}
                      alt={u.name}
                      className="w-12 h-12 object-contain hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  </Link>
                ) : (
                  <div className="w-12 h-12 rounded-md bg-white/[0.04]" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{u.name}</div>
                  <div className="h-1.5 mt-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-red to-orange-400"
                      style={{ width: `${u.usagePct}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display font-bold tabular-nums">
                    {u.usagePct.toFixed(1)}%
                  </div>
                  {u.winRatePct && (
                    <div className="text-[10px] text-accent-green tabular-nums">
                      WR {u.winRatePct.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5 text-brand-glow" />
              {livePartners ? 'Partners más vistos' : 'Core Pairs'}
            </h2>
            <span className="text-xs text-ink-faint">
              {livePartners ? 'Live Pikalytics' : 'Win rate por pareja'}
            </span>
          </div>
          <div className="card-base p-3 space-y-2">
            {livePartners ? (
              livePartners.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 p-3 rounded-xl glass"
                >
                  {p.speciesId ? (
                    <Link href={`/pokedex/${p.speciesId}`} className="shrink-0">
                      <img
                        src={artworkFor(p.speciesId)}
                        alt={p.name}
                        className="w-12 h-12 object-contain hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                    </Link>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-white/[0.04]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-[11px] text-ink-faint">
                      Aparece como partner en {p.appearances}/{PIVOT_POKEMON.length}{' '}
                      top Pokémon
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display font-bold text-accent-green tabular-nums">
                      {p.avgTeammatePct.toFixed(1)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-faint">
                      avg
                    </div>
                  </div>
                </div>
              ))
            ) : (
              coreWithIds.map((c) => (
                <div
                  key={`${c.pokemonA}-${c.pokemonB}`}
                  className="flex items-center gap-2 p-3 rounded-xl glass"
                >
                  <div className="flex items-center -space-x-3 shrink-0">
                    {c.aId ? (
                      <img
                        src={artworkFor(c.aId)}
                        alt={c.pokemonA}
                        className="w-12 h-12 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/[0.04]" />
                    )}
                    {c.bId ? (
                      <img
                        src={artworkFor(c.bId)}
                        alt={c.pokemonB}
                        className="w-12 h-12 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/[0.04]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight truncate">
                      {c.pokemonA} + {c.pokemonB}
                    </div>
                    {c.note && (
                      <div className="text-[11px] text-ink-faint truncate">
                        {c.note}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display font-bold text-accent-green tabular-nums text-lg">
                      {c.winRatePct}%
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-faint">
                      win rate
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Sample teams */}
      <section>
        <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-accent-yellow" />
              {live ? 'Equipos top del ladder ahora mismo' : 'Equipos top de torneos'}
            </h2>
            <p className="text-sm text-ink-dim mt-1">
              {live
                ? 'Equipos con mejor record en ladder Pikalytics. Cada uno importable a Showdown.'
                : 'Teams reales que han hecho top cut. Importa al Showdown con un clic.'}
            </p>
          </div>
          <Link
            href="/meta/teams"
            className="text-sm font-semibold text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
          >
            Ver explorador
          </Link>
        </div>

        <div className="space-y-4">
          {sampleTeams.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      </section>

      {/* Upcoming tournaments */}
      <section>
        <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-3">
          <ClockIcon className="w-5 h-5 text-accent-yellow" />
          Próximos torneos oficiales
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {CHAMPIONS_UPCOMING.map((t) => (
            <div
              key={t.name}
              className="card-base p-5 flex items-start gap-3"
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-accent-yellow/15 text-accent-yellow flex items-center justify-center">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold">{t.name}</div>
                <div className="text-xs font-mono text-accent-yellow mt-0.5">
                  {t.date}
                </div>
                <div className="text-xs text-ink-dim mt-1">{t.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center text-xs text-ink-faint pt-4 max-w-2xl mx-auto">
        {live ? (
          <>
            Equipos y partners: <span className="text-ink-soft">Pikalytics</span>{' '}
            (live, cache 24h). Usage % top: snapshot curado mayo 2026. Reg M-A
            vigente hasta 17 junio 2026.
          </>
        ) : (
          <>
            Datos curados mayo 2026. La conexión live con Pikalytics se
            recuperará automáticamente cuando vuelva.
          </>
        )}
      </div>
    </div>
  );
}
