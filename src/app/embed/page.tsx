'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ContenidoEmbed() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'es';
  const fechaEpisodeTwo = new Date('2007-10-10').getTime();
  const dias = Math.floor((Date.now() - fechaEpisodeTwo) / (1000 * 60 * 60 * 24));

  return (
    <div className="w-full h-screen bg-transparent flex items-center justify-center p-2 select-none overflow-hidden">
      <div className="bg-zinc-950/90 backdrop-blur-md border border-orange-500/60 rounded-2xl p-4 flex items-center gap-4 shadow-2xl text-left max-w-sm">
        <div className="w-14 h-14 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center text-3xl font-bold text-orange-500 shadow-lg shadow-orange-500/20">
          λ
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
            {lang === 'en' ? 'IS HALF-LIFE 3 OUT YET?' : '¿YA SALIÓ HALF-LIFE 3?'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-500 leading-none">NO</span>
            <span className="text-xs font-bold text-orange-400">
              • {dias.toLocaleString(lang === 'en' ? 'en-US' : 'es-AR')} {lang === 'en' ? 'days' : 'días'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 block mt-1">
            📡 radarblackmesa.online
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PaginaEmbed() {
  return (
    <Suspense fallback={<div className="text-white text-xs">Cargando...</div>}>
      <ContenidoEmbed />
    </Suspense>
  );
}

