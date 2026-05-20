// Dynamic Open Graph image for shared teams.
// Cuando alguien pega /teams/[slug] en Discord/Twitter/WhatsApp, ven una
// preview generada al momento con los 6 sprites del equipo + nombre.
//
// Funciona vía Next.js ImageResponse. Edge runtime para latencia mínima.

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Equipo Pokémon compartido en PokéHub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

interface TeamRow {
  id: string;
  name: string;
  format: string | null;
  members: Array<{ pokemonId: number; name: string }>;
}

async function fetchTeam(slug: string): Promise<TeamRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    // REST API directo — más ligero que el cliente JS de Supabase en edge runtime
    const res = await fetch(
      `${url}/rest/v1/teams?share_slug=eq.${encodeURIComponent(
        slug
      )}&is_public=eq.true&select=id,name,format,members&limit=1`,
      {
        headers: {
          apikey: anon,
          authorization: `Bearer ${anon}`,
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as TeamRow[];
    return data[0] ?? null;
  } catch {
    return null;
  }
}

export default async function TeamOpenGraphImage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const team = await fetchTeam(params.slug);

  if (!team) {
    // Fallback genérico si el team no existe / es privado
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#0B0F17',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          PokéHub · Equipo Pokémon
        </div>
      ),
      size
    );
  }

  const members = team.members.slice(0, 6);
  const formatLabel = team.format
    ? team.format.toUpperCase().replace('GEN9', 'SV ')
    : 'EQUIPO COMPARTIDO';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0B0F17',
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glows decorativos */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -100,
            width: 600,
            height: 600,
            background:
              'radial-gradient(circle, rgba(96,165,250,0.35) 0%, rgba(96,165,250,0) 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            right: -100,
            width: 600,
            height: 600,
            background:
              'radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(251,191,36,0) 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Header con branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background:
                'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ffffff 50%, #ffffff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid white',
            }}
          />
          <div
            style={{
              color: 'white',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            PokéHub
          </div>
          <div
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              borderRadius: 8,
              background: 'rgba(96,165,250,0.15)',
              color: '#60A5FA',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {formatLabel}
          </div>
        </div>

        {/* Nombre del team */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 50,
            zIndex: 1,
          }}
        >
          <div
            style={{
              color: '#94A3B8',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Equipo compartido
          </div>
          <div
            style={{
              color: 'white',
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              maxWidth: 1080,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {team.name}
          </div>
        </div>

        {/* Sprites del equipo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 'auto',
            gap: 16,
            zIndex: 1,
          }}
        >
          {members.map((m, i) => (
            <div
              key={`${m.pokemonId}-${i}`}
              style={{
                width: 170,
                height: 170,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${ARTWORK_BASE}/${m.pokemonId}.png`}
                alt={m.name}
                width={150}
                height={150}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
          {/* Slots vacíos si <6 miembros */}
          {Array.from({ length: 6 - members.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                width: 170,
                height: 170,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 32,
            color: '#64748B',
            fontSize: 16,
            zIndex: 1,
          }}
        >
          <div>pokehub.app/teams/{params.slug}</div>
          <div>{members.length}/6 Pokémon</div>
        </div>
      </div>
    ),
    size
  );
}
