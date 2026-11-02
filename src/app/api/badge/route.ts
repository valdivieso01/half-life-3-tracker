import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'es';
  const theme = searchParams.get('theme') || 'dark';

  const fechaEpisodeTwo = new Date('2007-10-10').getTime();
  const dias = Math.floor((Date.now() - fechaEpisodeTwo) / (1000 * 60 * 60 * 24));

  const textoTitulo = lang === 'en' ? 'IS HALF-LIFE 3 OUT YET?' : '¿YA SALIÓ HALF-LIFE 3?';
  const textoRespuesta = lang === 'en' ? 'NO' : 'NO';
  const textoDias = lang === 'en' 
    ? `${dias.toLocaleString('en-US')} days waiting` 
    : `${dias.toLocaleString('es-AR')} días esperando`;
  const textoSub = lang === 'en' ? 'radarblackmesa.online' : 'radarblackmesa.online';

  const bgColor = theme === 'black' ? '#000000' : '#09090b';
  const borderColor = '#f97316';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 140" width="440" height="140">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="#18181b" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#f97316" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Borde y Fondo -->
  <rect x="2" y="2" width="436" height="136" rx="14" fill="url(#bgGrad)" stroke="${borderColor}" stroke-width="2" />

  <!-- Logo Lambda -->
  <g transform="translate(24, 28)">
    <circle cx="42" cy="42" r="38" fill="rgba(249, 115, 22, 0.12)" stroke="#f97316" stroke-width="2.5" />
    <text x="42" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#f97316" text-anchor="middle" filter="url(#glow)">λ</text>
  </g>

  <!-- Textos Informativos -->
  <g transform="translate(126, 0)">
    <!-- Título superior -->
    <text x="0" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#a1a1aa" letter-spacing="1.5">
      ${textoTitulo}
    </text>

    <!-- Respuesta NO gigante -->
    <text x="0" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="900" fill="#ef4444" letter-spacing="0.5">
      ${textoRespuesta}
    </text>

    <!-- Días transcurridos -->
    <text x="75" y="74" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#fb923c">
      • ${textoDias}
    </text>

    <!-- Pie / Fuente -->
    <text x="0" y="112" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#71717a">
      📡 ${textoSub}
    </text>
  </g>
</svg>
`.trim();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

