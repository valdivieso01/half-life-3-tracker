'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Idioma } from '@/lib/i18n';

interface ArcadeHalfLifeProps {
  idioma?: Idioma;
}

interface Headcrab {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tipo: 'normal' | 'fast' | 'poison' | 'medkit';
  vida: number;
  maxVida: number;
  rotacion: number;
  rotSpeed: number;
}

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  vida: number;
  maxVida: number;
  radius: number;
}

export function ArcadeHalfLife({ idioma = 'es' }: ArcadeHalfLifeProps) {
  const esIngles = idioma === 'en';
  const [modo, setModo] = useState<'2d' | '3d'>('2d');

  // Estados del juego 2D
  const [jugando, setJugando] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [record, setRecord] = useState(0);
  const [salud, setSalud] = useState(100);
  const [combo, setCombo] = useState(0);
  const [audioHabilitado, setAudioHabilitado] = useState(true);
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false);

  // Modo 3D
  const [cargando3D, setCargando3D] = useState(false);
  const [juego3DIniciado, setJuego3DIniciado] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Refs de estado en el bucle del juego
  const estadoRef = useRef({
    jugando: false,
    gameOver: false,
    puntos: 0,
    salud: 100,
    combo: 0,
    ultimoGolpeCombo: 0,
    mousePos: { x: 300, y: 300 },
    swingTimer: 0,
    headcrabs: [] as Headcrab[],
    particulas: [] as Particula[],
    ultimoSpawn: 0,
    idContador: 1,
    audioHabilitado: true,
  });

  // Cargar récord guardado de localStorage
  useEffect(() => {
    try {
      const guardado = localStorage.getItem('hl3_arcade_record');
      if (guardado) {
        setRecord(Number(guardado) || 0);
      }
    } catch {
      // Ignorar restricciones de cookies o modo incógnito
    }
  }, []);

  // Inicializar o reanudar AudioContext
  const obtenerAudioContext = useCallback(() => {
    if (!audioHabilitado) return null;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, [audioHabilitado]);

  // Sonidos sintetizados clásicos de Half-Life usando Web Audio API
  const reproducirSonido = useCallback(
    (tipo: 'palanca' | 'impacto' | 'salto' | 'medkit' | 'dano' | 'flatline') => {
      const ctx = obtenerAudioContext();
      if (!ctx) return;

      const ahora = ctx.currentTime;

      if (tipo === 'palanca') {
        // Swing de la palanca: ráfaga sibilante rápida
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ahora);
        osc.frequency.exponentialRampToValueAtTime(140, ahora + 0.12);
        gain.gain.setValueAtTime(0.18, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.13);
      } else if (tipo === 'impacto') {
        // Clang metálico y crunch alienígena
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, ahora);
        osc.frequency.exponentialRampToValueAtTime(80, ahora + 0.16);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, ahora);
        osc2.frequency.exponentialRampToValueAtTime(300, ahora + 0.18);

        gain.gain.setValueAtTime(0.3, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.2);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc2.start(ahora);
        osc.stop(ahora + 0.2);
        osc2.stop(ahora + 0.2);
      } else if (tipo === 'salto') {
        // Chillido agudo de headcrab saltando
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, ahora);
        osc.frequency.linearRampToValueAtTime(2400, ahora + 0.08);
        osc.frequency.linearRampToValueAtTime(1200, ahora + 0.18);
        gain.gain.setValueAtTime(0.08, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.19);
      } else if (tipo === 'medkit') {
        // Doble beep alegre de recarga HEV
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ahora);
        osc.frequency.setValueAtTime(1040, ahora + 0.08);
        gain.gain.setValueAtTime(0.2, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.23);
      } else if (tipo === 'dano') {
        // Alerta de golpe al traje HEV
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, ahora);
        osc.frequency.exponentialRampToValueAtTime(60, ahora + 0.15);
        gain.gain.setValueAtTime(0.25, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.16);
      } else if (tipo === 'flatline') {
        // Tono continuo clásico de muerte del traje HEV
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ahora);
        gain.gain.setValueAtTime(0.25, ahora);
        gain.gain.setValueAtTime(0.25, ahora + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 1.55);
      }
    },
    [obtenerAudioContext]
  );

  // Iniciar partida 2D
  function iniciarPartida() {
    obtenerAudioContext();
    estadoRef.current = {
      jugando: true,
      gameOver: false,
      puntos: 0,
      salud: 100,
      combo: 0,
      ultimoGolpeCombo: Date.now(),
      mousePos: { x: 300, y: 300 },
      swingTimer: 0,
      headcrabs: [],
      particulas: [],
      ultimoSpawn: Date.now(),
      idContador: 1,
      audioHabilitado,
    };
    setPuntos(0);
    setSalud(100);
    setCombo(0);
    setGameOver(false);
    setJugando(true);
  }

  // Generar partículas al golpear
  function crearExplosion(x: number, y: number, color: string, cantidad = 12) {
    for (let i = 0; i < cantidad; i++) {
      const angulo = Math.random() * Math.PI * 2;
      const vel = 2 + Math.random() * 5;
      estadoRef.current.particulas.push({
        x,
        y,
        vx: Math.cos(angulo) * vel,
        vy: Math.sin(angulo) * vel,
        color,
        vida: 1,
        maxVida: 20 + Math.random() * 15,
        radius: 2 + Math.random() * 3,
      });
    }
  }

  // Golpe de la palanca (clic o espacio)
  const ejecutarGolpe = useCallback(() => {
    if (!estadoRef.current.jugando || estadoRef.current.gameOver) return;

    const ref = estadoRef.current;
    ref.swingTimer = 10;
    reproducirSonido('palanca');

    const mx = ref.mousePos.x;
    const my = ref.mousePos.y;
    const radioAlcance = 60;

    let impactoExitoso = false;

    // Verificar colisión con headcrabs
    for (let i = ref.headcrabs.length - 1; i >= 0; i--) {
      const hc = ref.headcrabs[i];
      const dist = Math.hypot(hc.x - mx, hc.y - my);

      if (dist <= radioAlcance + hc.radius) {
        impactoExitoso = true;
        hc.vida -= 1;

        if (hc.tipo === 'medkit') {
          // Curación
          ref.salud = Math.min(100, ref.salud + 30);
          setSalud(ref.salud);
          reproducirSonido('medkit');
          crearExplosion(hc.x, hc.y, '#10b981', 14);
          ref.headcrabs.splice(i, 1);
          continue;
        }

        if (hc.vida <= 0) {
          // Destruido
          reproducirSonido('impacto');
          const sangreColor = hc.tipo === 'poison' ? '#a855f7' : '#f97316';
          crearExplosion(hc.x, hc.y, sangreColor, 18);

          // Puntos y combos
          const ahora = Date.now();
          if (ahora - ref.ultimoGolpeCombo < 1800) {
            ref.combo += 1;
          } else {
            ref.combo = 1;
          }
          ref.ultimoGolpeCombo = ahora;

          const puntosSumar =
            (hc.tipo === 'fast' ? 250 : hc.tipo === 'poison' ? 350 : 100) *
            Math.min(ref.combo, 5);

          ref.puntos += puntosSumar;
          setPuntos(ref.puntos);
          setCombo(ref.combo);

          if (ref.puntos > record) {
            setRecord(ref.puntos);
            try {
              localStorage.setItem('hl3_arcade_record', String(ref.puntos));
            } catch {
              // Ignorar
            }
          }

          ref.headcrabs.splice(i, 1);
        } else {
          // Golpeado pero sigue vivo
          reproducirSonido('impacto');
          crearExplosion(hc.x, hc.y, '#eab308', 6);
          hc.vy = -4;
        }
      }
    }

    if (!impactoExitoso) {
      ref.combo = 0;
      setCombo(0);
    }
  }, [reproducirSonido, record]);

  // Manejo de eventos de entrada
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function actualizarMouse(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect) return;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      estadoRef.current.mousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }

    function actualizarTouch(e: TouchEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect || !e.touches[0]) return;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      estadoRef.current.mousePos = {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
      ejecutarGolpe();
    }

    function alHacerClick() {
      ejecutarGolpe();
    }

    function alPresionarTecla(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        ejecutarGolpe();
      }
    }

    canvas.addEventListener('mousemove', actualizarMouse);
    canvas.addEventListener('mousedown', alHacerClick);
    canvas.addEventListener('touchstart', actualizarTouch, { passive: true });
    window.addEventListener('keydown', alPresionarTecla);

    return () => {
      canvas.removeEventListener('mousemove', actualizarMouse);
      canvas.removeEventListener('mousedown', alHacerClick);
      canvas.removeEventListener('touchstart', actualizarTouch);
      window.removeEventListener('keydown', alPresionarTecla);
    };
  }, [ejecutarGolpe]);

  // Bucle principal de animación (Game Loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    function bucle() {
      if (!canvas || !ctx) return;
      const ref = estadoRef.current;
      const w = canvas.width || 800;
      const h = canvas.height || 500;

      // Limpiar fondo estilo conductos de ventilación de Black Mesa
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(0, 0, w, h);

      // Dibujar cuadrícula de ductos metálicos
      ctx.strokeStyle = '#181b26';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Detalle de rejas y remaches industriales
      ctx.fillStyle = '#1e2330';
      ctx.fillRect(0, 0, w, 24);
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('SECTOR C // ANOMALOUS MATERIALS // VENT SHAFT #03', 14, 16);

      if (ref.jugando && !ref.gameOver) {
        // Spawnear enemigos periódicamente
        const ahora = Date.now();
        const intervaloSpawn = Math.max(700, 2200 - Math.floor(ref.puntos / 300) * 120);

        if (ahora - ref.ultimoSpawn > intervaloSpawn) {
          ref.ultimoSpawn = ahora;
          const azar = Math.random();
          let tipo: Headcrab['tipo'] = 'normal';
          let maxVida = 1;

          if (azar > 0.9) {
            tipo = 'medkit'; // Botiquín curativo
          } else if (azar > 0.75) {
            tipo = 'poison'; // Headcrab venenoso resistente
            maxVida = 2;
          } else if (azar > 0.5) {
            tipo = 'fast'; // Headcrab rápido
          }

          const radio = tipo === 'medkit' ? 14 : tipo === 'poison' ? 22 : 18;
          const spawnX = Math.random() * (w - 100) + 50;

          ref.headcrabs.push({
            id: ref.idContador++,
            x: spawnX,
            y: 30,
            vx: (Math.random() - 0.5) * (tipo === 'fast' ? 4 : 2.5),
            vy: tipo === 'fast' ? 3.5 : 2.2,
            radius: radio,
            tipo,
            vida: maxVida,
            maxVida,
            rotacion: 0,
            rotSpeed: (Math.random() - 0.5) * 0.08,
          });

          if (tipo !== 'medkit') {
            reproducirSonido('salto');
          }
        }

        // Actualizar y dibujar Headcrabs
        for (let i = ref.headcrabs.length - 1; i >= 0; i--) {
          const hc = ref.headcrabs[i];
          hc.x += hc.vx;
          hc.y += hc.vy;
          hc.rotacion += hc.rotSpeed;

          // Rebote en paredes laterales
          if (hc.x - hc.radius < 0 || hc.x + hc.radius > w) {
            hc.vx *= -1;
          }

          // Dibujar enemigo / ítem
          ctx.save();
          ctx.translate(hc.x, hc.y);
          ctx.rotate(hc.rotacion);

          if (hc.tipo === 'medkit') {
            // Botiquín HEV de primeros auxilios
            ctx.fillStyle = '#064e3b';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-14, -14, 28, 28, 6);
            ctx.fill();
            ctx.stroke();

            // Cruz verde / blanca
            ctx.fillStyle = '#34d399';
            ctx.fillRect(-3, -9, 6, 18);
            ctx.fillRect(-9, -3, 18, 6);
          } else {
            // Cuerpo del Headcrab
            const colorCuerpo =
              hc.tipo === 'poison' ? '#581c87' : hc.tipo === 'fast' ? '#c2410c' : '#b45309';
            const colorPiel =
              hc.tipo === 'poison' ? '#9333ea' : hc.tipo === 'fast' ? '#ea580c' : '#d97706';

            ctx.fillStyle = colorCuerpo;
            ctx.beginPath();
            ctx.ellipse(0, 0, hc.radius, hc.radius * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Caparazón exterior
            ctx.fillStyle = colorPiel;
            ctx.beginPath();
            ctx.arc(0, -2, hc.radius * 0.7, Math.PI, 0);
            ctx.fill();

            // Patas delanteras articuladas
            ctx.strokeStyle = colorPiel;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-hc.radius * 0.6, 0);
            ctx.lineTo(-hc.radius * 1.3, hc.radius * 0.9);
            ctx.moveTo(hc.radius * 0.6, 0);
            ctx.lineTo(hc.radius * 1.3, hc.radius * 0.9);
            ctx.stroke();

            // Ojos / fauces carnosas inferiores
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(-4, 3, 2, 0, Math.PI * 2);
            ctx.arc(4, 3, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          // Si el headcrab llega al fondo (alcanza a Gordon)
          if (hc.y + hc.radius >= h - 20) {
            if (hc.tipo !== 'medkit') {
              ref.salud = Math.max(0, ref.salud - (hc.tipo === 'poison' ? 30 : 20));
              setSalud(ref.salud);
              reproducirSonido('dano');
              crearExplosion(hc.x, h - 30, '#ef4444', 16);

              if (ref.salud <= 0) {
                ref.gameOver = true;
                setGameOver(true);
                setJugando(false);
                reproducirSonido('flatline');
              }
            }
            ref.headcrabs.splice(i, 1);
          }
        }

        // Actualizar y dibujar partículas
        for (let i = ref.particulas.length - 1; i >= 0; i--) {
          const p = ref.particulas[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vida += 1;
          p.vy += 0.15; // Gravedad

          const alpha = Math.max(0, 1 - p.vida / p.maxVida);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          if (p.vida >= p.maxVida) {
            ref.particulas.splice(i, 1);
          }
        }

        // Dibujar mira / Palanca de Gordon Freeman
        const mx = ref.mousePos.x;
        const my = ref.mousePos.y;

        if (ref.swingTimer > 0) {
          ref.swingTimer -= 1;
        }

        ctx.save();
        ctx.translate(mx, my);

        // Efecto de barrido (swing) de la palanca
        const anguloPalanca = ref.swingTimer > 0 ? -0.7 : -0.2;
        ctx.rotate(anguloPalanca);

        // Mango de la palanca (rojo)
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-15, 25);
        ctx.lineTo(15, -20);
        ctx.stroke();

        // Gancho metálico doblado (plateado)
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(15, -20);
        ctx.lineTo(24, -32);
        ctx.lineTo(16, -38);
        ctx.stroke();

        // Mira HUD estilo Half-Life
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-6, 0);
        ctx.moveTo(6, 0);
        ctx.lineTo(20, 0);
        ctx.moveTo(0, -20);
        ctx.lineTo(0, -6);
        ctx.moveTo(0, 6);
        ctx.lineTo(0, 20);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(bucle);
    }

    animId = requestAnimationFrame(bucle);

    return () => cancelAnimationFrame(animId);
  }, [reproducirSonido]);

  // Pantalla completa
  function alternarPantallaCompleta() {
    if (!contenedorRef.current) return;
    if (!document.fullscreenElement) {
      contenedorRef.current.requestFullscreen?.().catch(() => {});
      setEnPantallaCompleta(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setEnPantallaCompleta(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto text-left space-y-6">
      {/* Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <span>🕹️</span>
            <span>{esIngles ? 'Sector E: Half-Life Browser Lab' : 'Sector E: Sala de Juegos de Half-Life'}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {esIngles
              ? 'Playable experiences straight inside your web browser while we wait for Half-Life 3'
              : 'Experiencias jugables directamente en tu navegador mientras esperamos Half-Life 3'}
          </p>
        </div>

        {/* Selector de Modo: 2D Arcade vs 3D Clásico */}
        <div className="inline-flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setModo('2d')}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              modo === '2d' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🔨 {esIngles ? 'Crowbar Strike (2D)' : 'Crowbar Strike (2D)'}
          </button>
          <button
            onClick={() => setModo('3d')}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              modo === '3d' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🎮 {esIngles ? 'Half-Life 1 3D (WebAssembly)' : 'Half-Life 1 3D (WebAssembly)'}
          </button>
        </div>
      </div>

      {/* MODO 1: CROWBAR STRIKE (MINIJUEGO 2D NATIVO) */}
      {modo === '2d' && (
        <div
          ref={contenedorRef}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Barra superior de HUD: HEV Suit Health + Score + Combo + Sonido */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-zinc-800/80 pb-3">
            {/* Traje HEV: Salud */}
            <div className="flex items-center gap-3">
              <span className="text-orange-500 font-mono font-bold text-xs">HEV SUIT</span>
              <div className="w-36 bg-zinc-900 border border-zinc-700 h-4 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    salud > 50 ? 'bg-emerald-500' : salud > 25 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${salud}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-zinc-200">{salud}%</span>
            </div>

            {/* Puntos y Récord */}
            <div className="flex items-center gap-6 font-mono text-xs">
              <div>
                <span className="text-zinc-500">{esIngles ? 'SCORE:' : 'PUNTOS:'} </span>
                <strong className="text-orange-400 text-sm">{puntos.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-zinc-500">{esIngles ? 'BEST:' : 'RÉCORD:'} </span>
                <strong className="text-zinc-300 text-sm">{record.toLocaleString()}</strong>
              </div>
              {combo > 1 && (
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded text-[11px] font-bold animate-pulse">
                  {combo}x COMBO!
                </span>
              )}
            </div>

            {/* Controles de utilería: Mute + Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAudioHabilitado((prev) => !prev)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                title={audioHabilitado ? 'Silenciar sonido' : 'Activar sonido'}
              >
                {audioHabilitado ? '🔊 SFX' : '🔇 Mute'}
              </button>
              <button
                onClick={alternarPantallaCompleta}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                title="Pantalla completa"
              >
                {enPantallaCompleta ? '🗗' : '⛶'}
              </button>
            </div>
          </div>

          {/* Lienzo del juego Canvas */}
          <div className="relative flex justify-center bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/80 cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={800}
              height={480}
              className="w-full max-h-[500px] object-contain block"
            />

            {/* Pantalla inicial antes de jugar */}
            {!jugando && !gameOver && (
              <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center text-3xl mb-4 text-orange-400">
                  λ
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-wide font-mono">
                  CROWBAR STRIKE // BLACK MESA DEFENSE
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-md mb-6">
                  {esIngles
                    ? 'Headcrabs are breaching Sector C ducts! Move your mouse or touch to aim, and click or press SPACE to swing Gordon Freeman’s crowbar!'
                    : '¡Los Headcrabs están invadiendo los ductos del Sector C! Mueve el ratón o toca la pantalla para apuntar, y haz clic o presiona ESPACIO para golpear con la palanca.'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400 mb-6 bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-xl">
                  <span>🖱️ Clic / Tap: {esIngles ? 'Swing Crowbar' : 'Golpear'}</span>
                  <span>⌨️ Espacio: {esIngles ? 'Strike' : 'Atacar'}</span>
                  <span>➕ Verde: {esIngles ? '+30 HP Medkit' : '+30 HP Botiquín'}</span>
                </div>

                <button
                  onClick={iniciarPartida}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-orange-600/30 cursor-pointer transition-all hover:scale-105"
                >
                  {esIngles ? '🎮 START MISSION' : '🎮 INICIAR MISIÓN'}
                </button>
              </div>
            )}

            {/* Pantalla de GAME OVER */}
            {gameOver && (
              <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <p className="text-red-500 font-mono text-xs font-bold tracking-widest mb-1">
                  SUBJECT: FREEMAN // STATUS: EVALUATION TERMINATED
                </p>
                <h3 className="text-3xl font-black text-white mb-3 font-mono">
                  {esIngles ? 'HEV SUIT FLATLINE' : 'TRAJE HEV DESACTIVADO'}
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm max-w-md mb-5">
                  {esIngles
                    ? 'You succumbed to the headcrab horde. But humanity is still waiting for Episode Three...'
                    : 'Caíste ante la horda de headcrabs. Pero la humanidad sigue esperando Half-Life 3...'}
                </p>

                <div className="bg-zinc-900/90 border border-red-500/30 rounded-xl px-6 py-3 mb-6 font-mono text-center">
                  <p className="text-zinc-400 text-xs">{esIngles ? 'FINAL SCORE' : 'PUNTAJE FINAL'}</p>
                  <p className="text-2xl font-bold text-orange-400">{puntos.toLocaleString()}</p>
                  {puntos >= record && puntos > 0 && (
                    <p className="text-emerald-400 text-[11px] font-semibold mt-1">
                      ⭐ {esIngles ? 'NEW RECORD!' : '¡NUEVO RÉCORD!'} ⭐
                    </p>
                  )}
                </div>

                <button
                  onClick={iniciarPartida}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105"
                >
                  🔄 {esIngles ? 'PLAY AGAIN' : 'REINTENTAR'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODO 2: HALF-LIFE 1 3D EN EL NAVEGADOR (WEBASSEMBLY / WEBGL) */}
      {modo === '3d' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>☢️</span>
                <span>{esIngles ? 'Half-Life 1 Classic (WebGL & WebAssembly)' : 'Half-Life 1 Clásico (WebGL y WebAssembly)'}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {esIngles
                  ? 'Runs the original Half-Life 1 engine directly inside your browser using Emscripten / WebGL.'
                  : 'Ejecuta el motor GoldSrc original de Half-Life 1 en tu navegador usando WebAssembly y WebGL sin instalar nada.'}
              </p>
            </div>

            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono px-3 py-1 rounded-lg">
              ● WASM Engine Ready
            </span>
          </div>

          {/* Guía rápida de controles clásicos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-zinc-300">
            <div>
              <span className="text-orange-400 block font-bold">W A S D</span>
              <span className="text-zinc-500">{esIngles ? 'Movement' : 'Moverse'}</span>
            </div>
            <div>
              <span className="text-orange-400 block font-bold">RATÓN / MOUSE</span>
              <span className="text-zinc-500">{esIngles ? 'Look & Aim' : 'Mirar y Apuntar'}</span>
            </div>
            <div>
              <span className="text-orange-400 block font-bold">CLICK IZQ / LEFT</span>
              <span className="text-zinc-500">{esIngles ? 'Fire / Crowbar' : 'Disparo / Palanca'}</span>
            </div>
            <div>
              <span className="text-orange-400 block font-bold">SPACE / CTRL / E</span>
              <span className="text-zinc-500">{esIngles ? 'Jump / Duck / Use' : 'Saltar / Agacharse / Usar'}</span>
            </div>
          </div>

          {/* Contenedor del visor 3D interactivo */}
          {!juego3DIniciado ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-3xl mx-auto text-orange-400 shadow-lg">
                🎮
              </div>
              <h4 className="text-xl font-bold text-zinc-100">
                {esIngles ? 'Launch Half-Life: Uplink / Hazard Course' : 'Cargar Half-Life: Uplink / Sala de Entrenamiento'}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                {esIngles
                  ? 'Clicking Launch will load the WebAssembly GoldSrc client inside the viewport. Audio and pointer lock will activate automatically.'
                  : 'Al hacer clic en Iniciar, se cargará el cliente WebAssembly de GoldSrc en el visor. El audio y el bloqueo de puntero del ratón se activarán para jugar como en el juego original.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setCargando3D(true);
                    setJuego3DIniciado(true);
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105"
                >
                  🚀 {esIngles ? 'Launch in Browser' : 'Iniciar en el Navegador'}
                </button>

                <a
                  href="https://archive.org/details/half-life-uplink-webassembly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold px-4 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <span>🌐</span>
                  <span>{esIngles ? 'Open Mirror on Archive.org' : 'Abrir Espejo en Archive.org'}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden aspect-video shadow-2xl">
              {cargando3D && (
                <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center z-10 gap-3">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-zinc-400">
                    {esIngles ? 'Mounting WebAssembly files & pak0.pak...' : 'Montando archivos WebAssembly y pak0.pak...'}
                  </p>
                </div>
              )}

              {/* Iframe con el sandbox WebAssembly optimizado */}
              <iframe
                src="https://archive.org/embed/half-life-uplink-webassembly"
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; pointer-lock"
                onLoad={() => setCargando3D(false)}
                title="Half-Life 1 WebAssembly"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}