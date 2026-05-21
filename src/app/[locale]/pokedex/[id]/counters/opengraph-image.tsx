// OG image dinámica para /pokedex/[id]/counters
// Cuando alguien comparte el link en Discord/Twitter/WhatsApp, ven
// preview personalizada con el sprite + "Counters de X" en grande.

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Counters de Pokémon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// Fetch básico del Pokémon en edge runtime (sin imports pesados)
async function getPokemonBasic(id: string): Promise<{ name: string } | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { name: data.name };
  } catch {
    return null;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
}

export default async function CountersOGImage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const pokemon = await getPokemonBasic(params.id);
  const name = pokemon ? capitalize(pokemon.name) : `#${params.id}`;

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
        {/* Red glow para el tema "counters" */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -100,
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(248,113,113,0.35) 0%, rgba(248,113,113,0) 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background:
                'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ffffff 50%, #ffffff 100%)',
              border: '3px solid white',
            }}
          />
          <div style={{ color: 'white', fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>
            PokéHub
          </div>
          <div
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(248,113,113,0.15)',
              color: '#f87171',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            🛡️ Counters
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 50,
            zIndex: 1,
            gap: 60,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div
              style={{
                color: '#94A3B8',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 5,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Cómo vencer a
            </div>
            <div
              style={{
                color: 'white',
                fontSize: 96,
                fontWeight: 800,
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              {name}
            </div>
            <div
              style={{
                color: '#f87171',
                fontSize: 24,
                fontWeight: 600,
                marginTop: 18,
                opacity: 0.9,
              }}
            >
              Counters duros · Checks · Estrategia
            </div>
          </div>
          <div
            style={{
              width: 360,
              height: 360,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${ARTWORK_BASE}/${params.id}.png`}
              alt={name}
              width={340}
              height={340}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            color: '#64748B',
            fontSize: 18,
            zIndex: 1,
          }}
        >
          <div>pokehub.app/pokedex/{params.id}/counters</div>
          <div style={{ fontWeight: 700, color: '#f87171' }}>
            Análisis competitivo →
          </div>
        </div>
      </div>
    ),
    size
  );
}
