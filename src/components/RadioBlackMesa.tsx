'use client';

import { useState, useRef, useEffect } from 'react';
import { Idioma, TRADUCCIONES } from '@/lib/i18n';

interface RadioBlackMesaProps {
  idioma?: Idioma;
}

export function RadioBlackMesa({ idioma = 'es' }: RadioBlackMesaProps) {
  const t = TRADUCCIONES[idioma];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.3); // Volumen por defecto 30%

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volumen;
    }
  }, [volumen]);

  function alternarReproduccion() {
    if (!audioRef.current) return;

    if (reproduciendo) {
      audioRef.current.pause();
      setReproduciendo(false);
    } else {
      audioRef.current
        .play()
        .then(() => setReproduciendo(true))
        .catch((err) => console.warn('Reproducción bloqueada por navegador:', err));
    }
  }

  return (
    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 shadow-sm text-xs select-none">
      <audio
        ref={audioRef}
        src="/audio/hazardous-environments.mp3"
        loop
        preload="none"
        onEnded={() => setReproduciendo(false)}
      />

      <button
        type="button"
        onClick={alternarReproduccion}
        title={`${t.radioTitulo}: ${t.radioTema}`}
        aria-label={reproduciendo ? t.radioPausa : t.radioPlay}
        className={`flex items-center gap-1.5 font-semibold px-2 py-1 rounded-lg transition-all cursor-pointer ${
          reproduciendo
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm shadow-orange-500/20'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
        }`}
      >
        <span className={reproduciendo ? 'animate-pulse text-orange-400' : 'text-zinc-500'}>
          📻
        </span>
        <span className="hidden sm:inline font-mono tracking-tight">
          {reproduciendo ? 'PAUSE' : 'RADIO'}
        </span>
        <span className="sm:hidden font-mono">
          {reproduciendo ? '⏸' : '▶'}
        </span>
      </button>

      {/* Control deslizable de volumen discreto */}
      {reproduciendo && (
        <div className="flex items-center gap-1.5 animate-in fade-in duration-200 pl-1">
          <span className="text-[10px] text-zinc-500">🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volumen}
            onChange={(e) => setVolumen(parseFloat(e.target.value))}
            className="w-14 sm:w-16 h-1 bg-zinc-800 accent-orange-500 rounded-lg cursor-pointer"
            aria-label="Volumen radio"
          />
        </div>
      )}
    </div>
  );
}
