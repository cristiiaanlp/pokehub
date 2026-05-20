import { getSupabaseServer } from '@/lib/supabase-server';
import { BADGES } from '@/lib/badges';
import { Link } from '@/i18n/routing';
import { ClockIcon } from '@/components/ui/Icon';

interface ActivityEvent {
  id: string;
  kind: string;
  payload: {
    teamId?: string;
    teamName?: string;
    badgeId?: string;
  };
  created_at: string;
}

const KIND_EMOJI: Record<string, string> = {
  team_published: '🌍',
  team_featured: '🏆',
  badge_earned: '🏅',
  first_team: '⚔️',
  profile_created: '🎉',
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d}d`;
  const months = Math.floor(d / 30);
  return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
}

function describe(ev: ActivityEvent): { text: string; href?: string } {
  const p = ev.payload ?? {};
  switch (ev.kind) {
    case 'team_published':
      return {
        text: `Publicó el equipo "${p.teamName ?? 'sin nombre'}"`,
        href: p.teamId ? `/teams/${p.teamId}` : undefined,
      };
    case 'team_featured':
      return {
        text: `Su equipo "${p.teamName ?? 'sin nombre'}" fue destacado por un admin`,
        href: p.teamId ? `/teams/${p.teamId}` : undefined,
      };
    case 'badge_earned': {
      const badge = p.badgeId ? BADGES[p.badgeId] : undefined;
      return {
        text: `Desbloqueó el logro: ${badge?.name ?? p.badgeId ?? 'logro'}`,
      };
    }
    case 'first_team':
      return { text: 'Creó su primer equipo' };
    case 'profile_created':
      return { text: 'Se unió a PokéHub' };
    default:
      return { text: ev.kind };
  }
}

export async function ActivityFeed({ userId }: { userId: string }) {
  const sb = getSupabaseServer();
  if (!sb) return null;

  const { data } = await sb
    .from('activity_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  const events = (data ?? []) as ActivityEvent[];
  if (events.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
        <ClockIcon className="w-4 h-4 text-accent-yellow" /> Actividad reciente
      </h2>
      <div className="card-base overflow-hidden">
        {events.map((ev, i) => {
          const { text, href } = describe(ev);
          const emoji = KIND_EMOJI[ev.kind] ?? '✨';
          const content = (
            <div className="flex items-center gap-3 p-3 hover:bg-white/[0.02]">
              <span className="text-xl shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0 text-sm">{text}</div>
              <span className="text-[10px] text-ink-faint shrink-0">
                {formatRelative(ev.created_at)}
              </span>
            </div>
          );
          return href ? (
            <Link
              key={ev.id}
              href={href}
              className={
                i < events.length - 1
                  ? 'block border-b border-white/[0.04]'
                  : 'block'
              }
            >
              {content}
            </Link>
          ) : (
            <div
              key={ev.id}
              className={
                i < events.length - 1
                  ? 'border-b border-white/[0.04]'
                  : ''
              }
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
