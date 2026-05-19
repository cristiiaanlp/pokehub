import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getProfileById } from '@/lib/profiles';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

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

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Mi cuenta
        </div>
        <h1 className="font-display text-3xl font-bold">Editar perfil</h1>
        <p className="text-sm text-ink-dim mt-1">
          Tu perfil es público en{' '}
          {profile.username ? (
            <code>/u/{profile.username}</code>
          ) : (
            <span>/u/[username]</span>
          )}
          . Elige un username único para activarlo.
        </p>
      </header>
      <ProfileEditor initial={profile} email={user.email ?? ''} />
    </div>
  );
}
