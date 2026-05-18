import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 16,
            background:
              'radial-gradient(circle at 30% 30%, #EF4444 0%, #B91C1C 70%, #7F1D1D 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 60px rgba(239,68,68,0.7)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 14,
            background: '#0B0F17',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '10px solid #0B0F17',
          }}
        />
      </div>
    ),
    size
  );
}
