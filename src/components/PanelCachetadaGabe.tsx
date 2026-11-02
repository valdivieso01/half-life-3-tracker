'use client';

import { useState, useRef, useEffect } from 'react';
import { Idioma, TRADUCCIONES } from '@/lib/i18n';

interface PanelCachetadaGabeProps {
  idioma?: Idioma;
}

export function PanelCachetadaGabe({ idioma = 'es' }: PanelCachetadaGabeProps) {
  const t = TRADUCCIONES[idioma];

  const [cachetadasGlobales, setCachetadasGlobales] = useState(0);
  const [cachetadasLocales, setCachetadasLocales] = useState(0);
  const [espejado, setEspejado] = useState(false);
  const [golpeando, setGolpeando] = useState(false);
  const [onomatopeya, setOnomatopeya] = useState('');
  const [indiceFrase, setIndiceFrase] = useState(0);
  const timerGolpeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Buffer para sincronizar clicks al backend en lotes (batching)
  const clicksPendientesRef = useRef(0);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar el conteo global desde la base de datos al inicio
  useEffect(() => {
    fetch('/api/cachetadas')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.total === 'number') {
          setCachetadasGlobales(data.total);
        }
      })
      .catch((err) => console.error('Error cargando conteo global de cachetadas:', err));
  }, []);

  function sincronizarConServidor() {
    if (clicksPendientesRef.current <= 0) return;
    const cantidad = clicksPendientesRef.current;
    clicksPendientesRef.current = 0;

    fetch('/api/cachetadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.total === 'number') {
          setCachetadasGlobales(data.total);
        }
      })
      .catch((err) => console.error('Error sincronizando cachetadas:', err));
  }

  // Sonido de cachetada sintetizado con Web Audio API (reutiliza el AudioContext)
  function reproducirSonidoCachetada() {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
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

    // Actualización visual inmediata e intuitiva
    setEspejado((prev) => !prev);
    setCachetadasGlobales((prev) => prev + 1);
    setCachetadasLocales((prev) => prev + 1);
    setGolpeando(true);

    // Acumula el golpe en lote para no saturar el endpoint
    clicksPendientesRef.current += 1;
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = setTimeout(() => {
      sincronizarConServidor();
    }, 600);

    const textoGolpe =
      t.cachetadaOnomatopeyas[
        Math.floor(Math.random() * t.cachetadaOnomatopeyas.length)
      ];
    setOnomatopeya(textoGolpe);
    setIndiceFrase((prev) => (prev + 1) % t.cachetadaFrases.length);

    if (timerGolpeRef.current) {
      clearTimeout(timerGolpeRef.current);
    }
    timerGolpeRef.current = setTimeout(() => {
      setGolpeando(false);
    }, 450);
  }

  // Transformación dinámica: espeja horizontalmente (scaleX) e inclina al recibir el golpe
  const transformStyle = `${espejado ? 'scaleX(-1)' : 'scaleX(1)'} ${
    golpeando ? 'rotate(-6deg) scale(0.96)' : 'rotate(0deg) scale(1)'
  }`;

  return (
    <aside className="w-full max-w-[220px] bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 shadow-xl select-none">
      <div className="text-center mb-3">
        <h3 className="text-sm font-bold text-orange-400">{t.cachetadaTitulo}</h3>
        <p className="text-[11px] text-zinc-400">{t.cachetadaSubtitulo}</p>
      </div>

      {/* Zona interactiva accesible con botón semántico y soporte de teclado */}
      <button
        type="button"
        onClick={pegarCachetada}
        title={t.cachetadaSubtitulo}
        aria-label={t.cachetadaTitulo}
        className="relative block w-full overflow-hidden rounded-xl border-2 border-zinc-800 hover:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer group bg-zinc-950 p-0 text-left"
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
      </button>

      <div className="mt-3 text-center flex flex-col items-center gap-1">
        <span className="inline-block bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold text-xs px-3 py-1 rounded-full">
          👋 {t.cachetadaContador(cachetadasGlobales)}
        </span>

        {cachetadasLocales > 0 && (
          <span className="text-[10px] text-zinc-400 font-medium">
            {t.cachetadaPersonales(cachetadasLocales)}
          </span>
        )}

        {cachetadasLocales > 0 && (
          <p className="mt-1 text-[11px] text-zinc-300 italic leading-snug">
            &ldquo;{t.cachetadaFrases[indiceFrase]}&rdquo;
          </p>
        )}
      </div>
    </aside>
  );
}
