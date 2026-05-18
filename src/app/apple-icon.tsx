import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0F17',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 14,
            background:
              'radial-gradient(circle at 30% 30%, #EF4444 0%, #B91C1C 70%, #7F1D1D 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 60px rgba(239,68,68,0.7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 12,
            background: '#0B0F17',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '9px solid #0B0F17',
          }}
        />
      </div>
    ),
    size
  );
}
