'use client';

import { useState } from 'react';
import { Idioma } from '@/lib/i18n';

interface ModalEmbedProps {
  idioma: Idioma;
  abierto: boolean;
  alCerrar: () => void;
}

export function ModalEmbed({ idioma, abierto, alCerrar }: ModalEmbedProps) {
  const [copiado, setCopiado] = useState<'markdown' | 'html' | 'twitch' | null>(null);

  if (!abierto) return null;

  const urlSitio = 'https://www.radarblackmesa.online';
  const urlBadge = `${urlSitio}/api/badge?lang=${idioma}`;
  const urlTwitch = `${urlSitio}/embed?lang=${idioma}`;

  const codigoMarkdown = `[![Half-Life 3 Tracker](${urlBadge})](${urlSitio})`;
  const codigoHtml = `<a href="${urlSitio}" target="_blank" rel="noopener noreferrer"><img src="${urlBadge}" alt="¿Ya salió Half-Life 3?" width="440" height="140" /></a>`;
  const codigoTwitch = `<iframe src="${urlTwitch}" width="380" height="100" frameborder="0" allowtransparency="true"></iframe>`;

  function copiarAlPortapapeles(texto: string, tipo: 'markdown' | 'html' | 'twitch') {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-left relative shadow-2xl">
        <button
          onClick={alCerrar}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-lg w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500 flex items-center justify-center text-xs font-bold text-orange-500">
            λ
          </span>
          <h3 className="text-lg font-bold text-white">
            {idioma === 'es' ? 'Insertar Tracker en vivo' : 'Embed Live Tracker'}
          </h3>
        </div>

        <p className="text-xs text-zinc-400 mb-5">
          {idioma === 'es'
            ? 'Inserta este badge con actualización en tiempo real en tu Discord, Reddit, GitHub README o transmisión de Twitch/OBS.'
            : 'Embed this real-time updating badge on your Discord, Reddit, GitHub README, or Twitch/OBS stream.'}
        </p>

        {/* Vista previa en vivo */}
        <div className="mb-5 flex justify-center bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
          <img src={`/api/badge?lang=${idioma}`} alt="Vista previa del badge" width={440} height={140} className="max-w-full h-auto" />
        </div>

        <div className="space-y-4">
          {/* Opción 1: Markdown para Discord / Reddit / GitHub */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
              <span>Markdown (Reddit / GitHub / Discord)</span>
              <button
                onClick={() => copiarAlPortapapeles(codigoMarkdown, 'markdown')}
                className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer"
              >
                {copiado === 'markdown' ? (idioma === 'es' ? '✓ ¡Copiado!' : '✓ Copied!') : (idioma === 'es' ? 'Copiar código' : 'Copy code')}
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={codigoMarkdown}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-lg px-3 py-2 select-all focus:outline-none"
            />
          </div>

          {/* Opción 2: HTML para Foros / Sitios web */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
              <span>HTML (Websites / Foros)</span>
              <button
                onClick={() => copiarAlPortapapeles(codigoHtml, 'html')}
                className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer"
              >
                {copiado === 'html' ? (idioma === 'es' ? '✓ ¡Copiado!' : '✓ Copied!') : (idioma === 'es' ? 'Copiar código' : 'Copy code')}
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={codigoHtml}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-lg px-3 py-2 select-all focus:outline-none"
            />
          </div>

          {/* Opción 3: Twitch / OBS Browser Source */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
              <span>Twitch / OBS Browser Source URL</span>
              <button
                onClick={() => copiarAlPortapapeles(urlTwitch, 'twitch')}
                className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer"
              >
                {copiado === 'twitch' ? (idioma === 'es' ? '✓ ¡Copiado!' : '✓ Copied!') : (idioma === 'es' ? 'Copiar URL' : 'Copy URL')}
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={urlTwitch}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-lg px-3 py-2 select-all focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

