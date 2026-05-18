import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PokéHub · La plataforma definitiva para entrenadores Pokémon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0B0F17',
          display: 'flex',
          flexDirection: 'column',
          padding: 64,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* glows */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -100,
            width: 600,
            height: 600,
            background:
              'radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)',
            filter: 'blur(60px)',
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
              'radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* subtle accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              'linear-gradient(90deg, #3B82F6 0%, #60A5FA 50%, #FACC15 100%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              position: 'relative',
              display: 'flex',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 30% 30%, #EF4444 0%, #B91C1C 100%)',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                height: 6,
                background: '#0B0F17',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#FFF',
                border: '4px solid #0B0F17',
              }}
            />
          </div>
          <div
            style={{
              color: '#F9FAFB',
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: -1,
              display: 'flex',
            }}
          >
            Poké<span style={{ color: '#60A5FA' }}>Hub</span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: 72,
            color: '#F9FAFB',
            fontSize: 90,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -2.5,
            display: 'flex',
            flexWrap: 'wrap',
            position: 'relative',
            maxWidth: 1000,
          }}
        >
          La plataforma definitiva para{' '}
          <span
            style={{
              background:
                'linear-gradient(90deg, #3B82F6 0%, #60A5FA 50%, #FACC15 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            entrenadores Pokémon
          </span>
        </div>

        <div
          style={{
            marginTop: 32,
            color: '#D1D5DB',
            fontSize: 30,
            display: 'flex',
            maxWidth: 900,
          }}
        >
          Pokédex moderna · Team Builder competitivo · Meta en vivo · TypeMaster
        </div>

        {/* Pills */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            gap: 12,
            position: 'relative',
          }}
        >
          {[
            { label: 'Pokémon Champions', color: '#EF4444' },
            { label: 'Smogon · Pikalytics', color: '#60A5FA' },
            { label: 'TypeMaster · XP & Ranks', color: '#FACC15' },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                padding: '10px 22px',
                borderRadius: 999,
                background: `${p.color}22`,
                color: p.color,
                fontSize: 22,
                fontWeight: 600,
                border: `2px solid ${p.color}44`,
                display: 'flex',
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
