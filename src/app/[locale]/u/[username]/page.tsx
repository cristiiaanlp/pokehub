import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getProfileByUsername } from '@/lib/profiles';
import { getSupabaseServer } from '@/lib/supabase-server';
import { BADGES } from '@/lib/badges';
import { artworkFor } from '@/lib/pokeapi';
import { ActivityFeed } from '@/components/profile/ActivityFeed';
import {
  TrophyIcon,
  HeartIcon,
  GridIcon,
  ClockIcon,
} from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { username: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const profile = await getProfileByUsername(params.username);
  if (!profile) return { title: 'Perfil no encontrado' };
  const name = profile.display_name || profile.username || 'Entrenador';
  return {
    title: `${name} · PokéHub`,
    description: profile.bio ?? `Perfil de ${name} en PokéHub`,
    openGraph: {
      title: `${name} · PokéHub`,
      description: profile.bio ?? `Perfil de ${name} en PokéHub`,
    },
  };
}

interface PublicTeam {
  id: string;
  name: string;
  members: any[];
  format: string | null;
  updated_at: string;
  share_slug: string | null;
}

export default async function ProfilePage({ params }: PageProps) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) notFound();

  const sb = getSupabaseServer();
  let teams: PublicTeam[] = [];
  let likesGiven = 0;
  let commentsCount = 0;
  if (sb) {
    const [{ data: t }, { count: liked }, { count: cm }] = await Promise.all([
      sb
        .from('teams')
        .select('id, name, members, format, updated_at, share_slug')
        .eq('user_id', profile.id)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(12),
      sb
        .from('team_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id),
      sb
        .from('team_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id),
    ]);
    teams = (t ?? []) as PublicTeam[];
    likesGiven = liked ?? 0;
    commentsCount = cm ?? 0;
  }

  const display = profile.display_name || profile.username || 'Entrenador';
  const initial = (display || '?').charAt(0).toUpperCase();
  const avatar = profile.avatar_pokemon_id
    ? artworkFor(profile.avatar_pokemon_id)
    : null;
  const badges = (profile.badges ?? []).filter((b) => BADGES[b]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      {/* Cabecera */}
      <header className="card-base p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4 sm:gap-6 flex-wrap">
          {avatar ? (
            <img
              src={avatar}
              alt={display}
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-full bg-bg-800 ring-2 ring-brand/30 shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-brand to-brand-glow flex items-center justify-center text-white font-bold text-4xl shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
              Entrenador
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {display}
            </h1>
            {profile.username && profile.display_name && (
              <div className="text-sm text-ink-faint mt-0.5">
                @{profile.username}
              </div>
            )}
            {profile.bio && (
              <p className="text-sm text-ink-soft mt-3 max-w-xl leading-relaxed">
                {profile.bio}
              </p>
            )}
            <div className="mt-3 text-[11px] text-ink-faint flex items-center gap-2">
              <ClockIcon className="w-3.5 h-3.5" />
              Desde {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <StatCard
          label="Equipos públicos"
          value={teams.length}
          Icon={GridIcon}
          tone="text-accent-green"
        />
        <StatCard
          label="Likes dados"
          value={likesGiven}
          Icon={HeartIcon}
          tone="text-accent-red"
        />
        <StatCard
          label="Comentarios"
          value={commentsCount}
          Icon={TrophyIcon}
          tone="text-accent-yellow"
        />
      </section>

      {/* Badges */}
      {badges.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 text-accent-yellow" /> Logros (
            {badges.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {badges.map((b) => {
              const meta = BADGES[b]!;
              return (
                <div
                  key={b}
                  className={`card-base p-3 border ${meta.tone}`}
                  title={meta.description}
                >
                  <div className="text-2xl">{meta.emoji}</div>
                  <div className="font-display font-bold text-sm mt-1">
                    {meta.name}
                  </div>
                  <div className="text-[10px] text-ink-dim mt-0.5">
                    {meta.description}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Activity feed */}
      <ActivityFeed userId={profile.id} />

      {/* Equipos */}
      <section>
        <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
          <GridIcon className="w-4 h-4 text-brand-glow" /> Equipos públicos
        </h2>
        {teams.length === 0 ? (
          <div className="card-base p-10 text-center text-ink-dim text-sm">
            Aún no ha publicado ningún equipo.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {teams.map((t) => (
              <Link
                key={t.id}
                href={
                  t.share_slug
                    ? `/teams/${t.share_slug}`
                    : `/teams/${t.id}`
                }
                className="card-base card-hover p-4"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="font-display font-bold truncate">{t.name}</div>
                  {t.format && (
                    <span className="text-[9px] font-mono text-ink-faint shrink-0 ml-2">
                      {t.format}
                    </span>
                  )}
                </div>
                <div className="flex -space-x-3">
                  {(t.members ?? []).slice(0, 6).map((m: any) => (
                    <img
                      key={m.pokemonId}
                      src={artworkFor(m.pokemonId)}
                      alt={m.name}
                      className="w-10 h-10 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          m.sprite ?? '';
                      }}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-ink-faint mt-2">
                  Actualizado {new Date(t.updated_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  Icon: any;
  tone: string;
}) {
  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold">
          {label}
        </div>
        <Icon className={`w-4 h-4 ${tone}`} />
      </div>
      <div className={`font-display text-2xl font-bold mt-1 tabular-nums ${tone}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
