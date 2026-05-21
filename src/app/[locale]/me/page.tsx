import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getProfileById } from '@/lib/profiles';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { TrainerCardPreview } from '@/components/profile/TrainerCardPreview';
import { DailyStreaksOverview } from '@/components/profile/DailyStreaksOverview';
import { BadgesShowcase } from '@/components/profile/BadgesShowcase';
import { ArrowRight, GridIcon } from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

export default async function MePage() {
  const sb = getSupabaseServer();
  if (!sb) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-sm text-ink-dim">
        Supabase no configurado.
      </div>
    );
  }
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect('/login?next=/me');

  const profile = (await getProfileById(user.id)) ?? {
    id: user.id,
    username: null,
    display_name: null,
    bio: null,
    avatar_pokemon_id: null,
    badges: [],
    onboarded_at: null,
    created_at: new Date().toISOString(),
  };

  const earnedBadges = Array.isArray(profile.badges) ? profile.badges : [];
  const displayName = profile.display_name || profile.username || user.email?.split('@')[0] || 'Entrenador';

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      {/* Hero dashboard */}
      <header className="card-base p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
            Bienvenido de vuelta
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {displayName}
          </h1>
          <p className="text-sm text-ink-dim mt-2">
            Tu centro de mando — rachas, logros, colección y perfil en un solo sitio.
          </p>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              href="/me/collection"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 h-9 rounded-lg bg-brand text-white hover:bg-brand-hover shadow-glow"
            >
              <GridIcon className="w-3.5 h-3.5" />
              Mi Living Pokédex
              <ArrowRight className="w-3 h-3" />
            </Link>
            {profile.username && (
              <Link
                href={`/u/${profile.username}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 h-9 rounded-lg glass hover:bg-white/[0.08]"
              >
                Ver perfil público
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            <Link
              href="/team-builder"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 h-9 rounded-lg glass hover:bg-white/[0.08]"
            >
              ⚔️ Team Builder
            </Link>
          </div>
        </div>
      </header>

      {/* Rachas diarias */}
      <DailyStreaksOverview />

      {/* Badges */}
      <BadgesShowcase earned={earnedBadges} />

      {/* Editar perfil — sección colapsable abajo */}
      <details className="card-base p-5 group" {...(!profile.username ? { open: true } : {})}>
        <summary className="cursor-pointer flex items-center justify-between font-display font-bold text-base list-none">
          <span className="flex items-center gap-2">
            ⚙️ Editar perfil
            {!profile.username && (
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-yellow/20 text-accent-yellow">
                Completar
              </span>
            )}
          </span>
          <ArrowRight className="w-4 h-4 text-ink-faint transition-transform group-open:rotate-90" />
        </summary>
        <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-4">
          <p className="text-sm text-ink-dim">
            Tu perfil es público en{' '}
            {profile.username ? (
              <code className="text-brand-glow">/u/{profile.username}</code>
            ) : (
              <span className="text-ink-faint">/u/[username]</span>
            )}
            . Elige un username único para activarlo.
          </p>
          <ProfileEditor initial={profile} email={user.email ?? ''} />
          {profile.username && <TrainerCardPreview username={profile.username} />}
        </div>
      </details>
    </div>
  );
}
