'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Idioma } from '@/lib/i18n';
import { RecordFichero } from '@/types/hl3';

interface ArcadeHalfLifeProps {
  idioma?: Idioma;
}

type TipoArma = 'palanca' | 'pistola' | 'escopeta';

type TipoEntidad =
  | 'normal'
  | 'fast'
  | 'poison'
  | 'vortigaunt'
  | 'manhack'
  | 'hecu'
  | 'grunt'
  | 'combine'
  | 'boss'
  | 'medkit'
  | 'caja'
  | 'municion';

interface ConfigNivel {
  nivel: number;
  minPuntos: number;
  nombreEs: string;
  nombreEn: string;
  banner: string;
  colorTema: string;
  intervaloBase: number;
}

const NIVELES_ARCADE: ConfigNivel[] = [
  {
    nivel: 1,
    minPuntos: 0,
    nombreEs: 'Sector C: Materiales Anómalos',
    nombreEn: 'Sector C: Anomalous Materials',
    banner: 'BLACK MESA // SECTOR C // ANOMALOUS MATERIALS',
    colorTema: '#ea580c',
    intervaloBase: 1750,
  },
  {
    nivel: 2,
    minPuntos: 500,
    nombreEs: 'Túneles & Vortigaunts',
    nombreEn: 'Tunnels & Vortigaunts',
    banner: 'BLACK MESA // SECTOR D // VORTIGAUNT INVASION',
    colorTema: '#10b981',
    intervaloBase: 1450,
  },
  {
    nivel: 3,
    minPuntos: 1500,
    nombreEs: 'Amenaza Militar (HECU)',
    nombreEn: "We've Got Hostiles (HECU)",
    banner: 'ALERT // WE\'VE GOT HOSTILES // HECU & MANHACKS',
    colorTema: '#eab308',
    intervaloBase: 1200,
  },
  {
    nivel: 4,
    minPuntos: 3000,
    nombreEs: 'Xen: Mundo Fronterizo',
    nombreEn: 'Xen: Borderworld',
    banner: 'XEN // BORDERWORLD // ALIEN GRUNT ASSAULT',
    colorTema: '#a855f7',
    intervaloBase: 1000,
  },
  {
    nivel: 5,
    minPuntos: 5000,
    nombreEs: 'La Ciudadela (Overwatch)',
    nombreEn: 'The Citadel (Overwatch)',
    banner: 'CITADEL // OVERWATCH ELITE // NIHILANTH THREAT',
    colorTema: '#ef4444',
    intervaloBase: 820,
  },
];

function obtenerNivelPorPuntos(puntos: number): ConfigNivel {
  for (let i = NIVELES_ARCADE.length - 1; i >= 0; i--) {
    if (puntos >= NIVELES_ARCADE[i].minPuntos) {
      return NIVELES_ARCADE[i];
    }
  }
  return NIVELES_ARCADE[0];
}

interface StatEnemigo {
  vida: number;
  radio: number;
  puntos: number;
  dano: number;
  vy: number;
  vxMax: number;
  colorSangre: string;
}

const STATS_ENEMIGOS: Record<Exclude<TipoEntidad, 'caja' | 'medkit' | 'municion'>, StatEnemigo> = {
  normal: { vida: 1, radio: 18, puntos: 100, dano: 15, vy: 2.0, vxMax: 2.0, colorSangre: '#f97316' },
  fast: { vida: 1, radio: 16, puntos: 200, dano: 20, vy: 3.3, vxMax: 4.0, colorSangre: '#fb923c' },
  poison: { vida: 2, radio: 21, puntos: 300, dano: 28, vy: 1.9, vxMax: 1.8, colorSangre: '#a855f7' },
  vortigaunt: { vida: 2, radio: 23, puntos: 350, dano: 25, vy: 2.1, vxMax: 2.4, colorSangre: '#22c55e' },
  manhack: { vida: 1, radio: 15, puntos: 250, dano: 18, vy: 3.1, vxMax: 5.5, colorSangre: '#ef4444' },
  hecu: { vida: 3, radio: 24, puntos: 450, dano: 30, vy: 1.8, vxMax: 1.6, colorSangre: '#ef4444' },
  grunt: { vida: 4, radio: 27, puntos: 600, dano: 35, vy: 1.6, vxMax: 1.5, colorSangre: '#c084fc' },
  combine: { vida: 4, radio: 24, puntos: 700, dano: 35, vy: 2.2, vxMax: 2.6, colorSangre: '#38bdf8' },
  boss: { vida: 10, radio: 42, puntos: 1200, dano: 50, vy: 0.9, vxMax: 1.4, colorSangre: '#facc15' },
};

const RECORDS_POR_DEFECTO: RecordFichero[] = [
  { tag: 'GAB', puntos: 15200, fecha: 'VALVE' },
  { tag: 'GFM', puntos: 12400, fecha: 'HEV-4' },
  { tag: 'BAR', puntos: 9800, fecha: 'SEC-C' },
  { tag: 'ALY', puntos: 7600, fecha: 'CIT17' },
  { tag: 'GMN', puntos: 5500, fecha: 'STASIS' },
];

interface EnemigoOItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tipo: TipoEntidad;
  vida: number;
  maxVida: number;
  rotacion: number;
  rotSpeed: number;
  faseZigzag?: number;
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
  const [nivelActual, setNivelActual] = useState(1);
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
    nivel: 1,
    alertaNivelTimer: 0,
    alertaNivelTexto: '',
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

  // Cargar tabla de récords desde API global (con fallback a localStorage)
  useEffect(() => {
    // 1. Cargar cache local inmediata para no parpadear
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

    // 2. Sincronizar en tiempo real con el Top global de Postgres
    fetch('/api/records')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.records) && data.records.length > 0) {
          setTablaRecords(data.records);
          setRecord(data.records[0].puntos);
          try {
            localStorage.setItem('hl3_fichines_records', JSON.stringify(data.records));
          } catch {
            // Ignorar
          }
        }
      })
      .catch((err) => {
        console.warn('Usando records locales:', err);
      });
  }, []);

  // Guardar nuevo puntaje en el Hall of Fame de Fichines (local + global)
  async function guardarNuevoRecord() {
    const tagLimpio = (tagJugador.trim() || 'FRE').toUpperCase().slice(0, 3);
    const nuevaEntrada: RecordFichero = {
      tag: tagLimpio,
      puntos: puntos,
      fecha: 'HOY',
    };

    // Actualización optimista inmediata
    const nuevaLista = [...tablaRecords, nuevaEntrada]
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 10);

    setTablaRecords(nuevaLista);
    setRecord(nuevaLista[0].puntos);
    setRecordGuardado(true);

    try {
      localStorage.setItem('hl3_fichines_records', JSON.stringify(nuevaLista));
    } catch {
      // Ignorar
    }

    // Persistencia global en Neon Postgres
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: tagLimpio, puntos }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.records) && data.records.length > 0) {
          setTablaRecords(data.records);
          setRecord(data.records[0].puntos);
          try {
            localStorage.setItem('hl3_fichines_records', JSON.stringify(data.records));
          } catch {
            // Ignorar
          }
        }
      }
    } catch (e) {
      console.warn('No se pudo sincronizar el récord globalmente:', e);
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
    (tipo: 'palanca' | 'pistola' | 'escopeta' | 'sin_balas' | 'impacto' | 'salto' | 'medkit' | 'caja' | 'dano' | 'flatline' | 'levelup' | 'boss') => {
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
      } else if (tipo === 'levelup') {
        const notas = [440, 554, 659, 880];
        notas.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const t = ahora + idx * 0.08;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
        });
      } else if (tipo === 'boss') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ahora);
        osc.frequency.exponentialRampToValueAtTime(55, ahora + 0.45);
        gain.gain.setValueAtTime(0.32, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.48);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ahora);
        osc.stop(ahora + 0.5);
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
      nivel: 1,
      alertaNivelTimer: 150,
      alertaNivelTexto: esIngles ? 'LEVEL 1: SECTOR C' : 'NIVEL 1: SECTOR C',
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
    setNivelActual(1);
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

  // Procesar impacto unificado para cualquier arma sobre ítems o enemigos
  const procesarImpactoEnItem = useCallback(
    (item: EnemigoOItem, index: number, dano: number, retrocesoY: number) => {
      const ref = estadoRef.current;

      if (item.tipo === 'caja') {
        reproducirSonido('caja');
        crearExplosion(item.x, item.y, '#d97706', 15);
        const esMedkit = Math.random() > 0.5;
        ref.enemigos.push({
          id: ref.idContador++,
          x: item.x,
          y: item.y,
          vx: 0,
          vy: 1.5,
          radius: 14,
          tipo: esMedkit ? 'medkit' : 'municion',
          vida: 1,
          maxVida: 1,
          rotacion: 0,
          rotSpeed: 0,
        });
        ref.enemigos.splice(index, 1);
        return;
      }

      if (item.tipo === 'medkit') {
        ref.salud = Math.min(100, ref.salud + 30);
        setSalud(ref.salud);
        reproducirSonido('medkit');
        crearExplosion(item.x, item.y, '#10b981', 14);
        ref.enemigos.splice(index, 1);
        return;
      }

      if (item.tipo === 'municion') {
        ref.balasPistola += 18;
        ref.balasEscopeta += 6;
        setBalasPistola(ref.balasPistola);
        setBalasEscopeta(ref.balasEscopeta);
        reproducirSonido('medkit');
        crearExplosion(item.x, item.y, '#f59e0b', 14);
        ref.enemigos.splice(index, 1);
        return;
      }

      item.vida -= dano;
      const stats = STATS_ENEMIGOS[item.tipo];

      if (item.vida <= 0) {
        reproducirSonido('impacto');
        crearExplosion(item.x, item.y, stats.colorSangre, item.tipo === 'boss' ? 35 : 18);

        const ahora = Date.now();
        if (ahora - ref.ultimoGolpeCombo < 1800) {
          ref.combo += 1;
        } else {
          ref.combo = 1;
        }
        ref.ultimoGolpeCombo = ahora;

        const puntosGanados = stats.puntos * Math.min(ref.combo, 5);
        ref.puntos += puntosGanados;
        setPuntos(ref.puntos);
        setCombo(ref.combo);

        // Si derrotamos al jefe, suelta recompensa doble
        if (item.tipo === 'boss') {
          ref.enemigos.push({
            id: ref.idContador++,
            x: item.x - 18,
            y: item.y,
            vx: -0.6,
            vy: 1.4,
            radius: 14,
            tipo: 'medkit',
            vida: 1,
            maxVida: 1,
            rotacion: 0,
            rotSpeed: 0,
          });
          ref.enemigos.push({
            id: ref.idContador++,
            x: item.x + 18,
            y: item.y,
            vx: 0.6,
            vy: 1.4,
            radius: 14,
            tipo: 'municion',
            vida: 1,
            maxVida: 1,
            rotacion: 0,
            rotSpeed: 0,
          });
        }

        // Verificar si subió de nivel
        const nuevoNivel = obtenerNivelPorPuntos(ref.puntos);
        if (nuevoNivel.nivel > ref.nivel) {
          ref.nivel = nuevoNivel.nivel;
          setNivelActual(nuevoNivel.nivel);
          ref.alertaNivelTimer = 180;
          ref.alertaNivelTexto = esIngles
            ? `LEVEL ${nuevoNivel.nivel}: ${nuevoNivel.nombreEn.toUpperCase()}`
            : `NIVEL ${nuevoNivel.nivel}: ${nuevoNivel.nombreEs.toUpperCase()}`;
          reproducirSonido('levelup');
        }

        ref.enemigos.splice(index, 1);
      } else {
        reproducirSonido('impacto');
        crearExplosion(item.x, item.y, '#eab308', 6);
        item.vy = Math.max(-4, item.vy - retrocesoY);
      }
    },
    [esIngles, reproducirSonido]
  );

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
          procesarImpactoEnItem(item, i, 1, 2.5);
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
        if (dist <= item.radius + 16) {
          procesarImpactoEnItem(item, i, 1, 2.5);
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

      const radioEscopeta = 115;
      for (let i = ref.enemigos.length - 1; i >= 0; i--) {
        const item = ref.enemigos[i];
        const dist = Math.hypot(item.x - mx, item.y - my);
        if (dist <= radioEscopeta) {
          procesarImpactoEnItem(item, i, 2, 4.0);
        }
      }
    }
  }, [procesarImpactoEnItem, reproducirSonido]);

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

      const nivelConfig = obtenerNivelPorPuntos(ref.puntos);

      ctx.fillStyle = '#1c2230';
      ctx.fillRect(0, 0, w, 24);
      ctx.fillStyle = nivelConfig.colorTema;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(nivelConfig.banner, 14, 16);

      if (ref.jugando && !ref.gameOver) {
        const ahora = Date.now();
        const intervaloSpawn = Math.max(580, nivelConfig.intervaloBase - (ref.puntos % 1000) * 0.25);

        if (ahora - ref.ultimoSpawn > intervaloSpawn) {
          ref.ultimoSpawn = ahora;
          const azar = Math.random();
          let tipo: TipoEntidad = 'normal';

          if (azar > 0.88) {
            tipo = 'caja';
          } else if (nivelConfig.nivel === 1) {
            tipo = azar > 0.58 ? 'fast' : 'normal';
          } else if (nivelConfig.nivel === 2) {
            if (azar > 0.68) tipo = 'vortigaunt';
            else if (azar > 0.48) tipo = 'poison';
            else if (azar > 0.24) tipo = 'fast';
            else tipo = 'normal';
          } else if (nivelConfig.nivel === 3) {
            if (azar > 0.7) tipo = 'hecu';
            else if (azar > 0.52) tipo = 'manhack';
            else if (azar > 0.34) tipo = 'vortigaunt';
            else if (azar > 0.16) tipo = 'poison';
            else tipo = 'fast';
          } else if (nivelConfig.nivel === 4) {
            if (azar > 0.66) tipo = 'grunt';
            else if (azar > 0.48) tipo = 'hecu';
            else if (azar > 0.3) tipo = 'manhack';
            else if (azar > 0.14) tipo = 'vortigaunt';
            else tipo = 'poison';
          } else {
            const hayBoss = ref.enemigos.some((e) => e.tipo === 'boss');
            if (!hayBoss && azar > 0.78) tipo = 'boss';
            else if (azar > 0.54) tipo = 'combine';
            else if (azar > 0.34) tipo = 'grunt';
            else if (azar > 0.16) tipo = 'hecu';
            else tipo = 'manhack';
          }

          if (tipo === 'caja') {
            ref.enemigos.push({
              id: ref.idContador++,
              x: Math.random() * (w - 120) + 60,
              y: 30,
              vx: (Math.random() - 0.5) * 1.8,
              vy: 2.0,
              radius: 20,
              tipo: 'caja',
              vida: 1,
              maxVida: 1,
              rotacion: 0,
              rotSpeed: (Math.random() - 0.5) * 0.06,
            });
          } else {
            const stats = STATS_ENEMIGOS[tipo as Exclude<TipoEntidad, 'caja' | 'medkit' | 'municion'>];
            const spawnX = Math.random() * (w - 140) + 70;
            ref.enemigos.push({
              id: ref.idContador++,
              x: spawnX,
              y: 32,
              vx: (Math.random() - 0.5) * stats.vxMax,
              vy: stats.vy,
              radius: stats.radio,
              tipo,
              vida: stats.vida,
              maxVida: stats.vida,
              rotacion: 0,
              rotSpeed: tipo === 'manhack' ? 0.25 : tipo === 'boss' || tipo === 'hecu' || tipo === 'combine' || tipo === 'grunt' || tipo === 'vortigaunt' ? 0 : (Math.random() - 0.5) * 0.08,
              faseZigzag: Math.random() * Math.PI * 2,
            });
            reproducirSonido(tipo === 'boss' ? 'boss' : 'salto');
          }
        }

        // Dibujar y actualizar enemigos
        for (let i = ref.enemigos.length - 1; i >= 0; i--) {
          const item = ref.enemigos[i];
          if (item.tipo === 'manhack') {
            item.faseZigzag = (item.faseZigzag || 0) + 0.15;
            item.x += Math.sin(item.faseZigzag) * 4.5 + item.vx * 0.3;
          } else {
            item.x += item.vx;
          }
          item.y += item.vy;
          item.rotacion += item.rotSpeed;

          if (item.x - item.radius < 0) {
            item.x = item.radius;
            item.vx = Math.abs(item.vx);
          } else if (item.x + item.radius > w) {
            item.x = w - item.radius;
            item.vx = -Math.abs(item.vx);
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
          } else if (item.tipo === 'vortigaunt') {
            // Vortigaunt (verde con ojo rojo central y manos eléctricas)
            ctx.fillStyle = '#14532d';
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -4, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(-15, 6, 4, 0, Math.PI * 2);
            ctx.arc(15, 6, 4, 0, Math.PI * 2);
            ctx.stroke();
          } else if (item.tipo === 'manhack') {
            // Manhack (dron sierra giratorio con luz roja)
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-16, 0);
            ctx.lineTo(16, 0);
            ctx.moveTo(0, -16);
            ctx.lineTo(0, 16);
            ctx.stroke();
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (item.tipo === 'hecu') {
            // Soldado HECU (casco táctico verde oliva + máscara antigás)
            ctx.fillStyle = '#365314';
            ctx.strokeStyle = '#84cc16';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-18, -20, 36, 40, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-12, -6, 24, 10);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-8, -3, 6, 4);
            ctx.fillRect(2, -3, 6, 4);
          } else if (item.tipo === 'grunt') {
            // Alien Grunt (armadura biológica púrpura/gris Xen)
            ctx.fillStyle = '#4c1d95';
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(-7, -4, 3, 0, Math.PI * 2);
            ctx.arc(7, -4, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (item.tipo === 'combine') {
            // Combine Elite (blanco/gris oscuro con visor cíclope rojo)
            ctx.fillStyle = '#e2e8f0';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -2, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (item.tipo === 'boss') {
            // Jefe Nihilanth (gran cerebro flotante dorado/púrpura con aura)
            ctx.fillStyle = '#581c87';
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(0, -8, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(-12, 8, 5, 0, Math.PI * 2);
            ctx.arc(12, 8, 5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Headcrabs (normal, fast, poison)
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

          // Barra de vida sobre enemigos resistentes (maxVida > 1)
          if (item.maxVida > 1) {
            const barW = Math.max(32, item.radius * 1.5);
            const barH = 5;
            const bx = item.x - barW / 2;
            const by = item.y - item.radius - 12;
            ctx.fillStyle = '#18181b';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = item.tipo === 'boss' ? '#facc15' : '#ef4444';
            ctx.fillRect(bx, by, barW * (item.vida / item.maxVida), barH);
          }

          if (item.y + item.radius >= h - 20) {
            if (item.tipo !== 'medkit' && item.tipo !== 'caja' && item.tipo !== 'municion') {
              const danoRecibido = STATS_ENEMIGOS[item.tipo].dano;
              ref.salud = Math.max(0, ref.salud - danoRecibido);
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

        // Banner animado de subida de nivel
        if (ref.alertaNivelTimer > 0) {
          ref.alertaNivelTimer -= 1;
          ctx.save();
          ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
          ctx.strokeStyle = nivelConfig.colorTema;
          ctx.lineWidth = 2;
          const bw = 380;
          const bh = 44;
          const bx = (w - bw) / 2;
          const by = 45;
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 10);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = nivelConfig.colorTema;
          ctx.font = 'bold 13px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`⚠ ${ref.alertaNivelTexto}`, w / 2, by + 27);
          ctx.restore();
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

        <div className="flex items-center gap-3 font-mono text-xs">
          <span
            className="font-bold px-2.5 py-1 rounded-lg border bg-zinc-900"
            style={{
              borderColor: NIVELES_ARCADE[nivelActual - 1]?.colorTema || '#ea580c',
              color: NIVELES_ARCADE[nivelActual - 1]?.colorTema || '#ea580c',
            }}
          >
            {esIngles ? `LVL ${nivelActual}` : `NIVEL ${nivelActual}`}
          </span>
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
            <div className="grid grid-cols-[34px_1fr_80px] text-[10px] text-zinc-500 font-bold border-b border-zinc-900 pb-1 px-1">
              <span>POS</span>
              <span>NAME</span>
              <span className="text-right">SCORE</span>
            </div>

            {tablaRecords.map((r, idx) => {
              const esPrimero = idx === 0;
              const esSegundo = idx === 1;
              const esTercero = idx === 2;

              return (
                <div
                  key={`${r.tag}-${idx}`}
                  className={`grid grid-cols-[34px_1fr_80px] items-center px-2 py-1.5 rounded-lg border transition-all ${
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
                    {r.fecha ? (
                      <span className="text-[9px] text-zinc-600 font-normal">({r.fecha})</span>
                    ) : null}
                  </span>

                  <span className="text-right font-bold text-[12px] text-zinc-100">
                    {r.puntos.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900 text-center">
            <p className="text-[10px] text-zinc-500">
              {esIngles
                ? '★ Global online leaderboard. Insert your 3-letter initials upon Game Over to enter.'
                : '★ Podio online global. Ingresa tus 3 iniciales al terminar la partida para clasificar.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}