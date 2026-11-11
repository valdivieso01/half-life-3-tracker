'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Idioma } from '@/lib/i18n';

interface ArcadeHalfLifeProps {
  idioma?: Idioma;
}

type TipoArma = 'palanca' | 'pistola' | 'escopeta';

interface RecordFichero {
  tag: string;
  puntos: number;
  arma: string;
  sector: string;
}

const RECORDS_POR_DEFECTO: RecordFichero[] = [
  { tag: 'GAB', puntos: 15200, arma: '💥', sector: 'VALVE' },
  { tag: 'GFM', puntos: 12400, arma: '🔨', sector: 'HEV-4' },
  { tag: 'BAR', puntos: 9800, arma: '🔫', sector: 'SEC-C' },
  { tag: 'ALY', puntos: 7600, arma: '🔫', sector: 'CIT17' },
  { tag: 'GMN', puntos: 5500, arma: '🔨', sector: 'STASIS' },
];

interface EnemigoOItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tipo: 'normal' | 'fast' | 'poison' | 'medkit' | 'caja' | 'municion';
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

  // Estados del juego
  const [jugando, setJugando] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [record, setRecord] = useState(15200);
  const [salud, setSalud] = useState(100);
  const [combo, setCombo] = useState(0);
  const [audioHabilitado, setAudioHabilitado] = useState(true);
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false);

  // Armas y Munición
  const [armaActual, setArmaActual] = useState<TipoArma>('palanca');
  const [balasPistola, setBalasPistola] = useState(24);
  const [balasEscopeta, setBalasEscopeta] = useState(8);

  // Fichero / Hall of Fame
  const [tablaRecords, setTablaRecords] = useState<RecordFichero[]>(RECORDS_POR_DEFECTO);
  const [tagJugador, setTagJugador] = useState('');
  const [recordGuardado, setRecordGuardado] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Refs para el bucle del juego (60 FPS)
  const estadoRef = useRef({
    jugando: false,
    gameOver: false,
    puntos: 0,
    salud: 100,
    combo: 0,
    ultimoGolpeCombo: 0,
    armaActual: 'palanca' as TipoArma,
    balasPistola: 24,
    balasEscopeta: 8,
    mousePos: { x: 400, y: 250 },
    swingTimer: 0,
    disparoTimer: 0,
    enemigos: [] as EnemigoOItem[],
    particulas: [] as Particula[],
    ultimoSpawn: 0,
    idContador: 1,
    audioHabilitado: true,
  });

  // Cargar tabla de récords de localStorage
  useEffect(() => {
    try {
      const guardados = localStorage.getItem('hl3_fichines_records');
      if (guardados) {
        const parseados: RecordFichero[] = JSON.parse(guardados);
        if (Array.isArray(parseados) && parseados.length > 0) {
          setTablaRecords(parseados);
          setRecord(parseados[0].puntos);
        }
      }
    } catch {
      // Ignorar restricciones locales
    }
  }, []);

  // Guardar nuevo puntaje en el Hall of Fame de Fichines
  function guardarNuevoRecord() {
    const tagLimpio = (tagJugador.trim() || 'FRE').toUpperCase().slice(0, 3);
    const armaIcono = armaActual === 'escopeta' ? '💥' : armaActual === 'pistola' ? '🔫' : '🔨';
    const nuevaEntrada: RecordFichero = {
      tag: tagLimpio,
      puntos: puntos,
      arma: armaIcono,
      sector: 'SEC-C',
    };

    const nuevaLista = [...tablaRecords, nuevaEntrada]
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 6);

    setTablaRecords(nuevaLista);
    setRecord(nuevaLista[0].puntos);
    setRecordGuardado(true);

    try {
      localStorage.setItem('hl3_fichines_records', JSON.stringify(nuevaLista));
    } catch {
      // Ignorar
    }
  }

  // Inicializar Web Audio API
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

  // Sintetizador de audio retro
  const reproducirSonido = useCallback(
    (tipo: 'palanca' | 'pistola' | 'escopeta' | 'sin_balas' | 'impacto' | 'salto' | 'medkit' | 'caja' | 'dano' | 'flatline') => {
      const ctx = obtenerAudioContext();
      if (!ctx) return;
      const ahora = ctx.currentTime;

      if (tipo === 'palanca') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ahora);
        osc.frequency.exponentialRampToValueAtTime(120, ahora + 0.12);
        gain.gain.setValueAtTime(0.2, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.13);
      } else if (tipo === 'pistola') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, ahora);
        osc.frequency.exponentialRampToValueAtTime(80, ahora + 0.14);
        gain.gain.setValueAtTime(0.35, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.15);
      } else if (tipo === 'escopeta') {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, ahora);
        osc.frequency.exponentialRampToValueAtTime(40, ahora + 0.28);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(140, ahora);
        osc2.frequency.exponentialRampToValueAtTime(30, ahora + 0.25);
        gain.gain.setValueAtTime(0.5, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.3);
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc2.start(ahora);
        osc.stop(ahora + 0.3);
        osc2.stop(ahora + 0.3);
      } else if (tipo === 'sin_balas') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, ahora);
        gain.gain.setValueAtTime(0.12, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.05);
      } else if (tipo === 'impacto') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, ahora);
        osc.frequency.exponentialRampToValueAtTime(90, ahora + 0.16);
        gain.gain.setValueAtTime(0.3, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.19);
      } else if (tipo === 'caja') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, ahora);
        osc.frequency.exponentialRampToValueAtTime(60, ahora + 0.15);
        gain.gain.setValueAtTime(0.3, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.16);
      } else if (tipo === 'salto') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1900, ahora);
        osc.frequency.linearRampToValueAtTime(2500, ahora + 0.08);
        osc.frequency.linearRampToValueAtTime(1100, ahora + 0.18);
        gain.gain.setValueAtTime(0.07, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.19);
      } else if (tipo === 'medkit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ahora);
        osc.frequency.setValueAtTime(1040, ahora + 0.09);
        gain.gain.setValueAtTime(0.2, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.23);
      } else if (tipo === 'dano') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, ahora);
        osc.frequency.exponentialRampToValueAtTime(60, ahora + 0.14);
        gain.gain.setValueAtTime(0.25, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.16);
      } else if (tipo === 'flatline') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ahora);
        gain.gain.setValueAtTime(0.28, ahora);
        gain.gain.setValueAtTime(0.28, ahora + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 1.55);
      }
    },
    [obtenerAudioContext]
  );

  // Cambiar arma activa
  function cambiarArma(nueva: TipoArma) {
    estadoRef.current.armaActual = nueva;
    setArmaActual(nueva);
    reproducirSonido('palanca');
  }

  // Iniciar partida
  function iniciarPartida() {
    obtenerAudioContext();
    estadoRef.current = {
      jugando: true,
      gameOver: false,
      puntos: 0,
      salud: 100,
      combo: 0,
      ultimoGolpeCombo: Date.now(),
      armaActual: 'palanca',
      balasPistola: 24,
      balasEscopeta: 8,
      mousePos: { x: 400, y: 250 },
      swingTimer: 0,
      disparoTimer: 0,
      enemigos: [],
      particulas: [],
      ultimoSpawn: Date.now(),
      idContador: 1,
      audioHabilitado,
    };
    setPuntos(0);
    setSalud(100);
    setCombo(0);
    setArmaActual('palanca');
    setBalasPistola(24);
    setBalasEscopeta(8);
    setRecordGuardado(false);
    setTagJugador('');
    setGameOver(false);
    setJugando(true);
  }

  // Explosión de partículas
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

  // Disparo o golpe
  const dispararOAtacar = useCallback(() => {
    const ref = estadoRef.current;
    if (!ref.jugando || ref.gameOver) return;

    const mx = ref.mousePos.x;
    const my = ref.mousePos.y;

    if (ref.armaActual === 'palanca') {
      ref.swingTimer = 10;
      reproducirSonido('palanca');
      const radioAlcance = 65;
      let impacto = false;

      for (let i = ref.enemigos.length - 1; i >= 0; i--) {
        const item = ref.enemigos[i];
        const dist = Math.hypot(item.x - mx, item.y - my);

        if (dist <= radioAlcance + item.radius) {
          impacto = true;
          item.vida -= 1;

          if (item.tipo === 'caja') {
            reproducirSonido('caja');
            crearExplosion(item.x, item.y, '#d97706', 15);
            if (Math.random() > 0.5) {
              ref.enemigos.push({
                id: ref.idContador++,
                x: item.x,
                y: item.y,
                vx: 0,
                vy: 1.5,
                radius: 14,
                tipo: 'medkit',
                vida: 1,
                maxVida: 1,
                rotacion: 0,
                rotSpeed: 0,
              });
            } else {
              ref.enemigos.push({
                id: ref.idContador++,
                x: item.x,
                y: item.y,
                vx: 0,
                vy: 1.5,
                radius: 14,
                tipo: 'municion',
                vida: 1,
                maxVida: 1,
                rotacion: 0,
                rotSpeed: 0,
              });
            }
            ref.enemigos.splice(i, 1);
            continue;
          }

          if (item.tipo === 'medkit') {
            ref.salud = Math.min(100, ref.salud + 30);
            setSalud(ref.salud);
            reproducirSonido('medkit');
            crearExplosion(item.x, item.y, '#10b981', 14);
            ref.enemigos.splice(i, 1);
            continue;
          }

          if (item.tipo === 'municion') {
            ref.balasPistola += 18;
            ref.balasEscopeta += 6;
            setBalasPistola(ref.balasPistola);
            setBalasEscopeta(ref.balasEscopeta);
            reproducirSonido('medkit');
            crearExplosion(item.x, item.y, '#f59e0b', 14);
            ref.enemigos.splice(i, 1);
            continue;
          }

          if (item.vida <= 0) {
            reproducirSonido('impacto');
            const sangre = item.tipo === 'poison' ? '#a855f7' : '#f97316';
            crearExplosion(item.x, item.y, sangre, 18);

            const ahora = Date.now();
            if (ahora - ref.ultimoGolpeCombo < 1800) {
              ref.combo += 1;
            } else {
              ref.combo = 1;
            }
            ref.ultimoGolpeCombo = ahora;

            const puntosGanados =
              (item.tipo === 'fast' ? 250 : item.tipo === 'poison' ? 350 : 100) *
              Math.min(ref.combo, 5);

            ref.puntos += puntosGanados;
            setPuntos(ref.puntos);
            setCombo(ref.combo);

            ref.enemigos.splice(i, 1);
          } else {
            reproducirSonido('impacto');
            crearExplosion(item.x, item.y, '#eab308', 6);
            item.vy = -3;
          }
        }
      }

      if (!impacto) {
        ref.combo = 0;
        setCombo(0);
      }
    } else if (ref.armaActual === 'pistola') {
      if (ref.balasPistola <= 0) {
        reproducirSonido('sin_balas');
        return;
      }
      ref.balasPistola -= 1;
      setBalasPistola(ref.balasPistola);
      ref.disparoTimer = 8;
      reproducirSonido('pistola');
      crearExplosion(mx, my, '#fbbf24', 6);

      for (let i = ref.enemigos.length - 1; i >= 0; i--) {
        const item = ref.enemigos[i];
        const dist = Math.hypot(item.x - mx, item.y - my);

        if (dist <= item.radius + 15) {
          item.vida -= 1;
          if (item.vida <= 0) {
            reproducirSonido('impacto');
            crearExplosion(item.x, item.y, '#f97316', 16);
            ref.puntos += 150;
            setPuntos(ref.puntos);
            ref.enemigos.splice(i, 1);
          } else {
            reproducirSonido('impacto');
            item.vy = -3;
          }
          break;
        }
      }
    } else if (ref.armaActual === 'escopeta') {
      if (ref.balasEscopeta <= 0) {
        reproducirSonido('sin_balas');
        return;
      }
      ref.balasEscopeta -= 1;
      setBalasEscopeta(ref.balasEscopeta);
      ref.disparoTimer = 14;
      reproducirSonido('escopeta');
      crearExplosion(mx, my, '#f97316', 20);

      const radioEscopeta = 110;
      for (let i = ref.enemigos.length - 1; i >= 0; i--) {
        const item = ref.enemigos[i];
        const dist = Math.hypot(item.x - mx, item.y - my);

        if (dist <= radioEscopeta) {
          item.vida -= 2;
          if (item.vida <= 0) {
            reproducirSonido('impacto');
            crearExplosion(item.x, item.y, '#ef4444', 20);
            ref.puntos += 250;
            setPuntos(ref.puntos);
            ref.enemigos.splice(i, 1);
          } else {
            item.vy = -5;
          }
        }
      }
    }
  }, [reproducirSonido]);

  // Manejo de eventos
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
      dispararOAtacar();
    }

    function alHacerClick() {
      dispararOAtacar();
    }

    function alPresionarTecla(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        dispararOAtacar();
      } else if (e.key === '1') {
        cambiarArma('palanca');
      } else if (e.key === '2') {
        cambiarArma('pistola');
      } else if (e.key === '3') {
        cambiarArma('escopeta');
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
  }, [dispararOAtacar]);

  // Game Loop
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

      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#151922';
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

      ctx.fillStyle = '#1c2230';
      ctx.fillRect(0, 0, w, 24);
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('BLACK MESA RESEARCH FACILITY // SECTOR C // ANOMALOUS MATERIALS', 14, 16);

      if (ref.jugando && !ref.gameOver) {
        const ahora = Date.now();
        const intervaloSpawn = Math.max(650, 2000 - Math.floor(ref.puntos / 300) * 110);

        if (ahora - ref.ultimoSpawn > intervaloSpawn) {
          ref.ultimoSpawn = ahora;
          const azar = Math.random();
          let tipo: EnemigoOItem['tipo'] = 'normal';
          let maxVida = 1;

          if (azar > 0.88) {
            tipo = 'caja';
            maxVida = 1;
          } else if (azar > 0.72) {
            tipo = 'poison';
            maxVida = 2;
          } else if (azar > 0.45) {
            tipo = 'fast';
          }

          const radio = tipo === 'caja' ? 20 : tipo === 'poison' ? 22 : 18;
          const spawnX = Math.random() * (w - 120) + 60;

          ref.enemigos.push({
            id: ref.idContador++,
            x: spawnX,
            y: 30,
            vx: (Math.random() - 0.5) * (tipo === 'fast' ? 4.2 : 2.2),
            vy: tipo === 'fast' ? 3.6 : 2.2,
            radius: radio,
            tipo,
            vida: maxVida,
            maxVida,
            rotacion: 0,
            rotSpeed: (Math.random() - 0.5) * 0.08,
          });

          if (tipo !== 'caja') {
            reproducirSonido('salto');
          }
        }

        // Dibujar y actualizar enemigos
        for (let i = ref.enemigos.length - 1; i >= 0; i--) {
          const item = ref.enemigos[i];
          item.x += item.vx;
          item.y += item.vy;
          item.rotacion += item.rotSpeed;

          if (item.x - item.radius < 0 || item.x + item.radius > w) {
            item.vx *= -1;
          }

          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotacion);

          if (item.tipo === 'caja') {
            ctx.fillStyle = '#78350f';
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 2;
            ctx.fillRect(-18, -18, 36, 36);
            ctx.strokeRect(-18, -18, 36, 36);

            ctx.beginPath();
            ctx.moveTo(-18, -18);
            ctx.lineTo(18, 18);
            ctx.moveTo(18, -18);
            ctx.lineTo(-18, 18);
            ctx.stroke();

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('λ', -4, 4);
          } else if (item.tipo === 'medkit') {
            ctx.fillStyle = '#064e3b';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-14, -14, 28, 28, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#34d399';
            ctx.fillRect(-3, -9, 6, 18);
            ctx.fillRect(-9, -3, 18, 6);
          } else if (item.tipo === 'municion') {
            ctx.fillStyle = '#713f12';
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-14, -12, 28, 24, 4);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('AMMO', -12, 4);
          } else {
            const colorCuerpo =
              item.tipo === 'poison' ? '#581c87' : item.tipo === 'fast' ? '#c2410c' : '#b45309';
            const colorPiel =
              item.tipo === 'poison' ? '#9333ea' : item.tipo === 'fast' ? '#ea580c' : '#d97706';

            ctx.fillStyle = colorCuerpo;
            ctx.beginPath();
            ctx.ellipse(0, 0, item.radius, item.radius * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = colorPiel;
            ctx.beginPath();
            ctx.arc(0, -2, item.radius * 0.7, Math.PI, 0);
            ctx.fill();

            ctx.strokeStyle = colorPiel;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-item.radius * 0.6, 0);
            ctx.lineTo(-item.radius * 1.3, item.radius * 0.9);
            ctx.moveTo(item.radius * 0.6, 0);
            ctx.lineTo(item.radius * 1.3, item.radius * 0.9);
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(-4, 3, 2, 0, Math.PI * 2);
            ctx.arc(4, 3, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          if (item.y + item.radius >= h - 20) {
            if (item.tipo !== 'medkit' && item.tipo !== 'caja' && item.tipo !== 'municion') {
              ref.salud = Math.max(0, ref.salud - (item.tipo === 'poison' ? 30 : 20));
              setSalud(ref.salud);
              reproducirSonido('dano');
              crearExplosion(item.x, h - 30, '#ef4444', 16);

              if (ref.salud <= 0) {
                ref.gameOver = true;
                setGameOver(true);
                setJugando(false);
                reproducirSonido('flatline');
              }
            }
            ref.enemigos.splice(i, 1);
          }
        }

        // Partículas
        for (let i = ref.particulas.length - 1; i >= 0; i--) {
          const p = ref.particulas[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vida += 1;
          p.vy += 0.15;

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

        // Arma y Mira
        const mx = ref.mousePos.x;
        const my = ref.mousePos.y;

        if (ref.swingTimer > 0) ref.swingTimer -= 1;
        if (ref.disparoTimer > 0) ref.disparoTimer -= 1;

        ctx.save();
        ctx.translate(mx, my);

        if (ref.armaActual === 'palanca') {
          const angulo = ref.swingTimer > 0 ? -0.7 : -0.2;
          ctx.rotate(angulo);
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-15, 25);
          ctx.lineTo(15, -20);
          ctx.stroke();

          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(15, -20);
          ctx.lineTo(24, -32);
          ctx.lineTo(16, -38);
          ctx.stroke();
        } else if (ref.armaActual === 'pistola') {
          const retroceso = ref.disparoTimer > 0 ? -4 : 0;
          ctx.translate(0, retroceso);
          ctx.fillStyle = '#334155';
          ctx.fillRect(-6, -14, 12, 28);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-4, -22, 8, 12);
        } else if (ref.armaActual === 'escopeta') {
          const retroceso = ref.disparoTimer > 0 ? -7 : 0;
          ctx.translate(0, retroceso);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-8, -26, 7, 34);
          ctx.fillRect(1, -26, 7, 34);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-9, 8, 18, 12);
        }

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
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <span>🕹️</span>
            <span>{esIngles ? 'Crowbar Strike // Black Mesa Defense' : 'Crowbar Strike // Defensa de Black Mesa'}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {esIngles
              ? 'Defend Sector C against jumping headcrabs! Use your crowbar, 9mm pistol and shotgun.'
              : '¡Defiende el Sector C contra los headcrabs! Usa tu palanca, la pistola 9mm y la escopeta.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500">HI-SCORE:</span>
          <span className="text-orange-400 font-bold text-sm bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
            {record.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grilla principal: Juego Canvas a la izquierda + Tabla de Fichines a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* LADO IZQUIERDO: CONTENEDOR DEL JUEGO */}
        <div
          ref={contenedorRef}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden"
        >
          {/* Barra superior de HUD: HEV Health + Armas + Munición */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-zinc-800/80 pb-3">
            {/* Salud del traje HEV */}
            <div className="flex items-center gap-2.5">
              <span className="text-orange-500 font-mono font-bold text-xs">HEV</span>
              <div className="w-24 sm:w-28 bg-zinc-900 border border-zinc-700 h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    salud > 50 ? 'bg-emerald-500' : salud > 25 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${salud}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-zinc-200">{salud}%</span>
            </div>

            {/* Selector interactivo de armas */}
            <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 font-mono text-xs">
              <button
                onClick={() => cambiarArma('palanca')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  armaActual === 'palanca'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="[1] Palanca cuerpo a cuerpo (Infinita)"
              >
                <span>[1] 🔨</span>
                <span>∞</span>
              </button>

              <button
                onClick={() => cambiarArma('pistola')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  armaActual === 'pistola'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="[2] Pistola 9mm Glock"
              >
                <span>[2] 🔫</span>
                <span className={balasPistola === 0 ? 'text-red-400' : ''}>{balasPistola}</span>
              </button>

              <button
                onClick={() => cambiarArma('escopeta')}
                className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  armaActual === 'escopeta'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="[3] Escopeta SPAS-12"
              >
                <span>[3] 💥</span>
                <span className={balasEscopeta === 0 ? 'text-red-400' : ''}>{balasEscopeta}</span>
              </button>
            </div>

            {/* Puntos y Controles */}
            <div className="flex items-center gap-3">
              <div className="font-mono text-xs">
                <span className="text-zinc-500">{esIngles ? 'PTS:' : 'PTS:'} </span>
                <strong className="text-orange-400 text-sm">{puntos.toLocaleString()}</strong>
              </div>

              {combo > 1 && (
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse">
                  {combo}x!
                </span>
              )}

              <button
                onClick={() => setAudioHabilitado((prev) => !prev)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors"
                title={audioHabilitado ? 'Silenciar sonido' : 'Activar sonido'}
              >
                {audioHabilitado ? '🔊' : '🔇'}
              </button>

              <button
                onClick={alternarPantallaCompleta}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors"
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
              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center text-3xl mb-4 text-orange-400 shadow-lg shadow-orange-500/20 animate-pulse">
                  λ
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-wide font-mono">
                  CROWBAR STRIKE // SECTOR C
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-md mb-5">
                  {esIngles
                    ? 'Smash headcrabs, break supply crates [λ], and switch weapons with [1] Crowbar, [2] 9mm, [3] Shotgun!'
                    : '¡Aplasta headcrabs, rompe cajas de suministros [λ], y cambia de arma con [1] Palanca, [2] Pistola y [3] Escopeta!'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-zinc-400 mb-6 bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-xl">
                  <span>🖱️ Clic: {esIngles ? 'Attack' : 'Atacar'}</span>
                  <span>⌨️ [1][2][3]: {esIngles ? 'Weapons' : 'Armas'}</span>
                  <span>📦 Cajas: {esIngles ? 'Items' : 'Botín'}</span>
                </div>

                <button
                  onClick={iniciarPartida}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-orange-600/30 cursor-pointer transition-all hover:scale-105"
                >
                  {esIngles ? '🎮 INSERT COIN / PLAY' : '🎮 INSERT COIN / JUGAR'}
                </button>
              </div>
            )}

            {/* Pantalla de GAME OVER con ingreso de iniciales estilo FICHINES */}
            {gameOver && (
              <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <p className="text-red-500 font-mono text-xs font-bold tracking-widest mb-1">
                  SUBJECT: FREEMAN // STATUS: EVALUATION TERMINATED
                </p>
                <h3 className="text-3xl font-black text-white mb-2 font-mono">
                  {esIngles ? 'GAME OVER' : 'FIN DEL JUEGO'}
                </h3>

                <div className="bg-zinc-900/90 border border-red-500/30 rounded-xl px-6 py-2.5 mb-4 font-mono text-center">
                  <p className="text-zinc-400 text-xs">{esIngles ? 'FINAL SCORE' : 'TU PUNTAJE'}</p>
                  <p className="text-2xl font-bold text-orange-400">{puntos.toLocaleString()}</p>
                </div>

                {/* Ingreso de iniciales (3 letras estilo Fichín / Arcade) */}
                {puntos > 0 && !recordGuardado ? (
                  <div className="bg-zinc-900 border border-orange-500/50 rounded-xl p-4 mb-4 max-w-xs w-full shadow-lg">
                    <p className="text-orange-400 font-mono text-xs font-bold mb-2">
                      ⭐ {esIngles ? 'ENTER YOUR INITIALS (3 LETTERS):' : '¡INGRESA TUS 3 INICIALES!'} ⭐
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <input
                        type="text"
                        maxLength={3}
                        value={tagJugador}
                        placeholder="GFM"
                        onChange={(e) => setTagJugador(e.target.value.toUpperCase())}
                        className="w-28 text-center uppercase tracking-widest font-mono text-xl font-bold bg-zinc-950 border border-orange-500 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={guardarNuevoRecord}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                      >
                        {esIngles ? 'SAVE' : 'GUARDAR'}
                      </button>
                    </div>
                  </div>
                ) : recordGuardado ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold px-4 py-2 rounded-xl mb-4">
                    ✓ {esIngles ? 'SCORE SAVED TO HALL OF FAME!' : '¡PUNTAJE REGISTRADO EN EL FICHERO!'}
                  </div>
                ) : null}

                <button
                  onClick={iniciarPartida}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105"
                >
                  🔄 {esIngles ? 'PLAY AGAIN' : 'JUGAR DE NUEVO'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LADO DERECHO: TABLA DE MEJORES PUNTAJES ESTILO FICHINES (HALL OF FAME) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl font-mono">
          <div className="border-b border-zinc-800 pb-3 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-base">🏆</span>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
                {esIngles ? 'HALL OF FAME' : 'TOP FICHERO'}
              </h3>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">BLACK MESA</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-[30px_1fr_60px_24px] text-[10px] text-zinc-500 font-bold border-b border-zinc-900 pb-1 px-1">
              <span>POS</span>
              <span>NAME</span>
              <span className="text-right">SCORE</span>
              <span className="text-right">GUN</span>
            </div>

            {tablaRecords.map((r, idx) => {
              const esPrimero = idx === 0;
              const esSegundo = idx === 1;
              const esTercero = idx === 2;

              return (
                <div
                  key={`${r.tag}-${idx}`}
                  className={`grid grid-cols-[30px_1fr_60px_24px] items-center px-1.5 py-1.5 rounded-lg border transition-all ${
                    esPrimero
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                      : esSegundo
                        ? 'bg-zinc-900 border-zinc-700/60 text-zinc-200'
                        : esTercero
                          ? 'bg-zinc-900/60 border-zinc-800 text-orange-300'
                          : 'border-transparent text-zinc-400 hover:bg-zinc-900/40'
                  }`}
                >
                  <span className="text-[11px] font-bold">
                    {esPrimero ? '🥇' : esSegundo ? '🥈' : esTercero ? '🥉' : `${idx + 1}.`}
                  </span>

                  <span className="tracking-widest font-bold flex items-center gap-1.5">
                    <span className={esPrimero ? 'text-amber-300' : 'text-orange-400'}>{r.tag}</span>
                    <span className="text-[9px] text-zinc-600 font-normal">({r.sector})</span>
                  </span>

                  <span className="text-right font-bold text-[11px] text-zinc-100">
                    {r.puntos.toLocaleString()}
                  </span>

                  <span className="text-right text-xs" title="Arma favorita">
                    {r.arma}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900 text-center">
            <p className="text-[10px] text-zinc-500">
              {esIngles
                ? '★ Insert your 3-letter initials upon Game Over to enter the arcade leaderboard.'
                : '★ Ingresa tus 3 iniciales al terminar la partida para entrar al podio de fichines.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}