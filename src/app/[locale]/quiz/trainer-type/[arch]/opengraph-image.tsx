// OG image dinámica para resultado del quiz "tipo de entrenador".
// Cuando alguien comparte /quiz/trainer-type/sweeper en Twitter/WhatsApp/Discord,
// ven una preview personalizada con su arquetipo + 3 Pokémon emblema.

import { ImageResponse } from 'next/og';
import { TRAINER_RESULTS, type TrainerArchetype } from '@/lib/trainer-quiz';

export const runtime = 'edge';
export const alt = 'Tu arquetipo competitivo en Pokémon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

export default function TrainerOGImage({
  params,
}: {
  params: { arch: string; locale: string };
}) {
  const result = TRAINER_RESULTS[params.arch as TrainerArchetype];

  if (!result) {
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
          PokéHub · Quiz tipo de entrenador
        </div>
      ),
      size
    );
  }

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
        {/* Glow del color del arquetipo */}
        <div
          style={{
            position: 'absolute',
            top: -250,
            right: -150,
            width: 700,
            height: 700,
            background: `radial-gradient(circle, ${result.accent}55 0%, ${result.accent}00 70%)`,
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            left: -150,
            width: 500,
            height: 500,
            background: `radial-gradient(circle, ${result.accent}33 0%, ${result.accent}00 70%)`,
            borderRadius: '50%',
          }}
        />

        {/* Header branding */}
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
              width: 48,
              height: 48,
              borderRadius: 12,
              background:
                'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ffffff 50%, #ffffff 100%)',
              border: '3px solid white',
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
          <div
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              color: '#94A3B8',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Quiz · Mi arquetipo
          </div>
        </div>

        {/* Contenido central */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 60,
            zIndex: 1,
            gap: 40,
          }}
        >
          {/* Lado izquierdo: emoji + título */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontSize: 140, lineHeight: 1, marginBottom: 12 }}>
              {result.emoji}
            </div>
            <div
              style={{
                color: '#94A3B8',
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 4,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Soy
            </div>
            <div
              style={{
                color: result.accent,
                fontSize: 72,
                fontWeight: 800,
                letterSpacing: -1.5,
                lineHeight: 1,
              }}
            >
              {result.title}
            </div>
            <div
              style={{
                color: 'white',
                fontSize: 26,
                fontWeight: 500,
                fontStyle: 'italic',
                marginTop: 18,
                opacity: 0.85,
              }}
            >
              "{result.tagline}"
            </div>
          </div>

          {/* Lado derecho: 3 Pokémon emblema */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {result.iconicPokemon.map((id, i) => (
              <div
                key={id}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.04)',
                  border: `2px solid ${result.accent}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translateX(${i % 2 === 0 ? -10 : 10}px)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${ARTWORK_BASE}/${id}.png`}
                  alt={`#${id}`}
                  width={140}
                  height={140}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ))}
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
          <div>pokehub.app/quiz/trainer-type</div>
          <div style={{ fontWeight: 700, color: result.accent }}>
            Haz el test tú también →
          </div>
        </div>
      </div>
    ),
    size
  );
}
