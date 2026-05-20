// GET /api/trainer-card?username=ash
//
// Genera una imagen 1080×1080 estilo "trainer card" con: avatar pokemon,
// username, badges, equipo destacado y branding. Edge runtime para latencia
// y cache automática vía la URL params.
//
// Render usando next/og (mismo motor que opengraph-image.tsx). La imagen
// resultante se puede descargar o embed en Twitter/Discord (OG).

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

interface Profile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_pokemon_id: number | null;
  badges: string[];
  created_at: string;
}

interface TeamRow {
  name: string;
  members: Array<{ pokemonId: number; name: string }>;
}

async function fetchProfile(username: string): Promise<Profile | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/profiles?username=eq.${encodeURIComponent(
        username
      )}&select=username,display_name,bio,avatar_pokemon_id,badges,created_at,id&limit=1`,
      {
        headers: { apikey: anon, authorization: `Bearer ${anon}` },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const arr = (await res.json()) as (Profile & { id: string })[];
    return arr[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchTopTeam(userId: string): Promise<TeamRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/teams?user_id=eq.${encodeURIComponent(
        userId
      )}&is_public=eq.true&select=name,members&order=updated_at.desc&limit=1`,
      {
        headers: { apikey: anon, authorization: `Bearer ${anon}` },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const arr = (await res.json()) as TeamRow[];
    return arr[0] ?? null;
  } catch {
    return null;
  }
}

const BADGE_EMOJI: Record<string, string> = {
  pioneer: '🚩',
  first_team: '⚔️',
  team_published: '🌍',
  team_featured: '🏆',
  typemaster_silver: '🥈',
  typemaster_gold: '🥇',
  daily_quiz_streak_7: '🔥',
  favorite_collector: '❤️',
  social_butterfly: '💬',
  liked_10: '⭐',
};

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username') ?? '';
  if (!username) {
    return new Response('username required', { status: 400 });
  }

  const profile = await fetchProfile(username);
  if (!profile) {
    return new Response('profile not found', { status: 404 });
  }

  // El cast de id existe porque pedimos arriba en el select
  const userId = (profile as Profile & { id: string }).id;
  const team = await fetchTopTeam(userId);
  const members = (team?.members ?? []).slice(0, 6);

  const displayName = profile.display_name || profile.username;
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  });
  const badges = (profile.badges ?? []).slice(0, 6);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, #0B0F17 0%, #1A1F2E 50%, #0B0F17 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -150,
            left: -100,
            width: 500,
            height: 500,
            background:
              'radial-gradient(circle, rgba(96,165,250,0.4) 0%, rgba(96,165,250,0) 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -100,
            width: 500,
            height: 500,
            background:
              'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0) 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Top: branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background:
                  'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ffffff 50%, #ffffff 100%)',
                border: '4px solid white',
              }}
            />
            <div
              style={{
                color: 'white',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              PokéHub
            </div>
          </div>
          <div
            style={{
              color: '#60A5FA',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Trainer Card
          </div>
        </div>

        {/* Avatar + username */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 30,
            marginTop: 50,
            zIndex: 1,
          }}
        >
          {profile.avatar_pokemon_id ? (
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                background: 'rgba(255,255,255,0.04)',
                border: '4px solid rgba(96,165,250,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${ARTWORK_BASE}/${profile.avatar_pokemon_id}.png`}
                alt="avatar"
                width={180}
                height={180}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                background:
                  'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 96,
                fontWeight: 800,
              }}
            >
              {initial}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                color: 'white',
                fontSize: 60,
                fontWeight: 800,
                letterSpacing: -1.5,
                lineHeight: 1.1,
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                color: '#60A5FA',
                fontSize: 24,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              @{profile.username}
            </div>
            <div
              style={{
                color: '#94A3B8',
                fontSize: 18,
                marginTop: 10,
              }}
            >
              Entrenando desde {memberSince}
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 30,
              zIndex: 1,
            }}
          >
            {badges.map((b) => (
              <div
                key={b}
                style={{
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: 'rgba(251,191,36,0.12)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  color: '#FBBF24',
                  fontSize: 18,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{BADGE_EMOJI[b] ?? '🏅'}</span>
                <span>{b.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Team showcase */}
        {members.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginTop: 'auto',
              zIndex: 1,
            }}
          >
            <div
              style={{
                color: '#94A3B8',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase',
              }}
            >
              Equipo destacado · {team?.name}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {members.map((m, i) => (
                <div
                  key={`${m.pokemonId}-${i}`}
                  style={{
                    width: 142,
                    height: 142,
                    borderRadius: 18,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${ARTWORK_BASE}/${m.pokemonId}.png`}
                    alt={m.name}
                    width={130}
                    height={130}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              ))}
              {Array.from({ length: 6 - members.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    width: 142,
                    height: 142,
                    borderRadius: 18,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#64748B',
            fontSize: 14,
            marginTop: 24,
            zIndex: 1,
          }}
        >
          <div>pokehub.app/u/{profile.username}</div>
          <div>{(profile.badges ?? []).length} logros</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
