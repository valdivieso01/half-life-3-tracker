import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Radar Black Mesa de Half-Life 3 - ¿Ya salió en Steam?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * IMAGEN OPENGRAPH DINÁMICA (src/app/opengraph-image.tsx)
 * Next.js convierte este JSX en una imagen PNG real de 1200x630px
 * que aparece automáticamente cuando compartís el link por WhatsApp, Discord o X.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          border: '12px solid #ea580c',
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: 'rgba(249, 115, 22, 0.15)',
            border: '4px solid #f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            fontWeight: 'bold',
            color: '#f97316',
            marginBottom: 28,
          }}
        >
          λ
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#ffffff',
            marginBottom: 16,
          }}
        >
          ¿Ya salió Half-Life 3?
        </div>

        <div
          style={{
            fontSize: 30,
            color: '#a1a1aa',
          }}
        >
          Radar Black Mesa • Noticias en Vivo • Altar a Gabe Newell
        </div>
      </div>
    ),
    { ...size }
  );
}

