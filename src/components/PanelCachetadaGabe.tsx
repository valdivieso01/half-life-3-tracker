'use client';

import { useState, useRef } from 'react';
import { Idioma, TRADUCCIONES } from '@/lib/i18n';

interface PanelCachetadaGabeProps {
  idioma?: Idioma;
}

export function PanelCachetadaGabe({ idioma = 'es' }: PanelCachetadaGabeProps) {
  const t = TRADUCCIONES[idioma];

  const [cachetadas, setCachetadas] = useState(0);
  const [espejado, setEspejado] = useState(false);
  const [golpeando, setGolpeando] = useState(false);
  const [onomatopeya, setOnomatopeya] = useState('');
  const [indiceFrase, setIndiceFrase] = useState(0);
  const timerGolpeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sonido de cachetada sintetizado con Web Audio API (sin archivos MP3 externos)
  function reproducirSonidoCachetada() {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const duracion = 0.09;

      // Ruido blanco corto para el "chasquido" de la cachetada
      const bufferSize = ctx.sampleRate * duracion;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duracion);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Ignorar si el navegador bloquea audio
    }
  }

  function pegarCachetada() {
    reproducirSonidoCachetada();

    // Espejamos la imagen hacia el otro lado en cada golpe
    setEspejado((prev) => !prev);
    setCachetadas((prev) => prev + 1);
    setGolpeando(true);

    const textoGolpe =
      t.cachetadaOnomatopeyas[
        Math.floor(Math.random() * t.cachetadaOnomatopeyas.length)
      ];
    setOnomatopeya(textoGolpe);
    setIndiceFrase((prev) => (prev + 1) % t.cachetadaFrases.length);

    if (timerGolpeRef.current) {
      clearTimeout(timerGolpeRef.current);
    }
    // Mantiene la cara de cacheteado durante 450ms y luego vuelve a la sonrisa sobradora (idle)
    timerGolpeRef.current = setTimeout(() => {
      setGolpeando(false);
    }, 450);
  }

  // Transformación dinámica: espeja horizontalmente (scaleX) e inclina al recibir el golpe
  const transformStyle = `${espejado ? 'scaleX(-1)' : 'scaleX(1)'} ${
    golpeando ? 'rotate(-6deg) scale(0.96)' : 'rotate(0deg) scale(1)'
  }`;

  return (
    <aside className="mt-8 xl:mt-0 xl:fixed xl:right-6 xl:top-1/2 xl:-translate-y-1/2 w-full max-w-xs xl:w-60 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-xl z-20 select-none">
      <div className="text-center mb-3">
        <h3 className="text-sm font-bold text-orange-400">{t.cachetadaTitulo}</h3>
        <p className="text-[11px] text-zinc-400">{t.cachetadaSubtitulo}</p>
      </div>

      {/* Zona clickeable: muestra /gabe-idle.jpg en reposo y cambia a /gabe-slap.jpg al golpear */}
      <div
        onClick={pegarCachetada}
        title={t.cachetadaSubtitulo}
        className="relative overflow-hidden rounded-xl border-2 border-zinc-800 hover:border-orange-500/60 cursor-pointer group bg-zinc-950"
      >
        {/* Precarga oculta de la imagen de golpe para cambio instantáneo sin parpadeo */}
        <link rel="preload" as="image" href="/gabe-slap.jpg" />

        <img
          src={golpeando ? '/gabe-slap.jpg' : '/gabe-idle.jpg'}
          alt="Gabe Newell"
          draggable={false}
          style={{
            transform: transformStyle,
            transition: 'transform 80ms cubic-bezier(0.2, 0.9, 0.3, 1.3)',
          }}
          className="w-full aspect-square object-cover"
        />

        {/* Flash rojo y onomatopeya cuando recibe la cachetada */}
        {golpeando && (
          <div className="absolute inset-0 bg-red-500/20 pointer-events-none flex items-start justify-center pt-3">
            <span className="bg-orange-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg animate-bounce">
              {onomatopeya}
            </span>
          </div>
        )}

        {/* Mano flotante indicando que es clickeable */}
        <span className="absolute bottom-2 right-2 text-xl opacity-80 group-hover:scale-125 transition-transform pointer-events-none">
          👋
        </span>
      </div>

      <div className="mt-3 text-center">
        <span className="inline-block bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs px-3 py-1 rounded-full">
          👋 {t.cachetadaContador(cachetadas)}
        </span>

        {cachetadas > 0 && (
          <p className="mt-2 text-[11px] text-zinc-300 italic leading-snug">
            &ldquo;{t.cachetadaFrases[indiceFrase]}&rdquo;
          </p>
        )}
      </div>
    </aside>
  );
}
