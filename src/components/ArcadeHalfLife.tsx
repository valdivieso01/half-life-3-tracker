'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Idioma } from '@/lib/i18n';

interface ArcadeHalfLifeProps {
  idioma?: Idioma;
}

type TipoArma = 'palanca' | 'pistola' | 'escopeta';

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

  // Pestaña activa: 'arcade' (el juego) o 'info' (explicación de emulación)
  const [pestana, setPestana] = useState<'arcade' | 'info'>('arcade');

  // Estados del juego
  const [jugando, setJugando] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [record, setRecord] = useState(0);
  const [salud, setSalud] = useState(100);
  const [combo, setCombo] = useState(0);
  const [audioHabilitado, setAudioHabilitado] = useState(true);
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false);

  // Armas y Munición
  const [armaActual, setArmaActual] = useState<TipoArma>('palanca');
  const [balasPistola, setBalasPistola] = useState(24);
  const [balasEscopeta, setBalasEscopeta] = useState(8);

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

  // Cargar récord de localStorage
  useEffect(() => {
    try {
      const guardado = localStorage.getItem('hl3_arcade_record');
      if (guardado) {
        setRecord(Number(guardado) || 0);
      }
    } catch {
      // Ignorar restricciones locales
    }
  }, []);

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

  // Sintetizador de audio retro para efectos clásicos de Half-Life
  const reproducirSonido = useCallback(
    (tipo: 'palanca' | 'pistola' | 'escopeta' | 'sin_balas' | 'impacto' | 'salto' | 'medkit' | 'caja' | 'dano' | 'flatline') => {
      const ctx = obtenerAudioContext();
      if (!ctx) return;
      const ahora = ctx.currentTime;

      if (tipo === 'palanca') {
        // Swing metálico rápido
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
        // Disparo de 9mm Glock (Half-Life 1)
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
        // Disparo SPAS-12 pesado y explosivo
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
        // Clic de percutor vacío
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
        // Clang metálico y crunch alienígena
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
        // Ruido sordo de madera quebrándose
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
        // Chillido característico de headcrab saltando
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
        // Tono ascendente de recarga de salud HEV
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
        // Alerta de daño del traje
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
        // Pitido largo continuo de muerte de Gordon Freeman
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
            // La caja suelta munición o vida
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

            if (ref.puntos > record) {
              setRecord(ref.puntos);
              try {
                localStorage.setItem('hl3_arcade_record', String(ref.puntos));
              } catch {
                // Ignorar
              }
            }

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

      // Impacto en el punto de mira
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

      // Disparo en abanico (destruye múltiples enemigos en el área)
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
  }, [reproducirSonido, record]);

  // Manejo de eventos de mouse y teclado
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

  // Bucle de animación (Game Loop)
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

      // Fondo metálico oscuro de Black Mesa
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, w, h);

      // Rejilla de paneles de ventilación
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

      // Viga superior con remaches y rótulo
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
            tipo = 'caja'; // Caja de madera con suministros
            maxVida = 1;
          } else if (azar > 0.72) {
            tipo = 'poison'; // Headcrab venenoso
            maxVida = 2;
          } else if (azar > 0.45) {
            tipo = 'fast'; // Headcrab rápido
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

        // Dibujar y actualizar enemigos y cajas
        for (let i = ref.enemigos.length - 1; i >= 0; i--) {
          const item = ref.enemigos[i];
          item.x += item.vx;
          item.y += item.vy;
          item.rotacion += item.rotSpeed;

          // Rebote en paredes
          if (item.x - item.radius < 0 || item.x + item.radius > w) {
            item.vx *= -1;
          }

          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotacion);

          if (item.tipo === 'caja') {
            // Caja de madera de suministros de Black Mesa
            ctx.fillStyle = '#78350f';
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 2;
            ctx.fillRect(-18, -18, 36, 36);
            ctx.strokeRect(-18, -18, 36, 36);

            // Cruz en la caja
            ctx.beginPath();
            ctx.moveTo(-18, -18);
            ctx.lineTo(18, 18);
            ctx.moveTo(18, -18);
            ctx.lineTo(-18, 18);
            ctx.stroke();

            // Sello lambda
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('λ', -4, 4);
          } else if (item.tipo === 'medkit') {
            // Botiquín HEV
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
            // Caja de munición dorada
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
            // Headcrab
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

            // Patas
            ctx.strokeStyle = colorPiel;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-item.radius * 0.6, 0);
            ctx.lineTo(-item.radius * 1.3, item.radius * 0.9);
            ctx.moveTo(item.radius * 0.6, 0);
            ctx.lineTo(item.radius * 1.3, item.radius * 0.9);
            ctx.stroke();

            // Ojos
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(-4, 3, 2, 0, Math.PI * 2);
            ctx.arc(4, 3, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          // Si el enemigo toca el fondo (alcanza a Gordon)
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

        // Dibujar Arma / Mira en la posición del ratón
        const mx = ref.mousePos.x;
        const my = ref.mousePos.y;

        if (ref.swingTimer > 0) ref.swingTimer -= 1;
        if (ref.disparoTimer > 0) ref.disparoTimer -= 1;

        ctx.save();
        ctx.translate(mx, my);

        if (ref.armaActual === 'palanca') {
          // Palanca clásica roja
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
          // Pistola 9mm con retroceso
          const retroceso = ref.disparoTimer > 0 ? -4 : 0;
          ctx.translate(0, retroceso);
          ctx.fillStyle = '#334155';
          ctx.fillRect(-6, -14, 12, 28);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-4, -22, 8, 12);
        } else if (ref.armaActual === 'escopeta') {
          // Cañón doble de escopeta
          const retroceso = ref.disparoTimer > 0 ? -7 : 0;
          ctx.translate(0, retroceso);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-8, -26, 7, 34);
          ctx.fillRect(1, -26, 7, 34);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-9, 8, 18, 12);
        }

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
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <span>🕹️</span>
            <span>{esIngles ? 'Sector E: Half-Life Web Arcade' : 'Sector E: Arcade Web de Half-Life'}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {esIngles
              ? 'Playable in-browser experience built with zero external dependencies and retro audio.'
              : 'Juego nativo de navegador con audio retro, armamento y cero dependencias externas.'}
          </p>
        </div>

        {/* Selector de Pestaña: Juego vs Info */}
        <div className="inline-flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setPestana('arcade')}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              pestana === 'arcade' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🔨 {esIngles ? 'Crowbar Strike (Game)' : 'Crowbar Strike (Juego)'}
          </button>
          <button
            onClick={() => setPestana('info')}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              pestana === 'info' ? 'bg-orange-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ℹ️ {esIngles ? 'About 3D HL1 in Browser' : 'Sobre HL1 3D en la Web'}
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: CROWBAR STRIKE (JUEGO 100% FUNCIONAL Y NATIVO) */}
      {pestana === 'arcade' && (
        <div
          ref={contenedorRef}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Barra superior de HUD: HEV Health + Armas + Munición + Récord */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-zinc-800/80 pb-3">
            {/* Salud del traje HEV */}
            <div className="flex items-center gap-3">
              <span className="text-orange-500 font-mono font-bold text-xs">HEV SUIT</span>
              <div className="w-32 bg-zinc-900 border border-zinc-700 h-4 rounded-full overflow-hidden p-0.5">
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
            <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 font-mono text-xs">
              <button
                onClick={() => cambiarArma('palanca')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  armaActual === 'palanca'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="[1] Palanca cuerpo a cuerpo (Munición infinita)"
              >
                <span>[1] 🔨</span>
                <span>∞</span>
              </button>

              <button
                onClick={() => cambiarArma('pistola')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
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
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
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

            {/* Puntos y Récord */}
            <div className="flex items-center gap-4 font-mono text-xs">
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

            {/* Utilidades de pantalla y audio */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAudioHabilitado((prev) => !prev)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
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
              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center text-3xl mb-4 text-orange-400 shadow-lg shadow-orange-500/20">
                  λ
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-wide font-mono">
                  CROWBAR STRIKE // BLACK MESA DEFENSE
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mb-6">
                  {esIngles
                    ? 'Sector C has suffered a containment breach! Smash jumping headcrabs, break supply crates with [λ], and switch weapons [1] Crowbar, [2] 9mm Pistol, [3] Shotgun!'
                    : '¡El Sector C ha sufrido una brecha de contención! Golpea headcrabs, rompe cajas de suministros con [λ], y cambia de arma con [1] Palanca, [2] Pistola 9mm, [3] Escopeta.'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-400 mb-6 bg-zinc-900/80 border border-zinc-800 px-4 py-2.5 rounded-xl">
                  <span>🖱️ Clic / Tap: {esIngles ? 'Attack / Shoot' : 'Atacar / Disparar'}</span>
                  <span>⌨️ [1][2][3]: {esIngles ? 'Weapons' : 'Armas'}</span>
                  <span>📦 Cajas: {esIngles ? 'Ammo & Health' : 'Munición y Salud'}</span>
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
                    ? 'The right man in the wrong place can make all the difference in the world...'
                    : 'El hombre adecuado en el sitio equivocado puede cambiar el rumbo del mundo...'}
                </p>

                <div className="bg-zinc-900/90 border border-red-500/30 rounded-xl px-6 py-3 mb-6 font-mono text-center">
                  <p className="text-zinc-400 text-xs">{esIngles ? 'FINAL SCORE' : 'PUNTAJE FINAL'}</p>
                  <p className="text-2xl font-bold text-orange-400">{puntos.toLocaleString()}</p>
                  {puntos >= record && puntos > 0 && (
                    <p className="text-emerald-400 text-[11px] font-semibold mt-1">
                      ⭐ {esIngles ? 'NEW HIGH SCORE!' : '¡NUEVO RÉCORD!'} ⭐
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

      {/* PESTAÑA 2: INFORMACIÓN Y CÓMO JUGAR A HALF-LIFE 1 EN 3D */}
      {pestana === 'info' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 text-zinc-300 text-sm">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>☢️</span>
              <span>{esIngles ? 'Why does running 3D Half-Life in the browser require setup?' : '¿Por qué jugar a Half-Life 1 en 3D en la web requiere configuración?'}</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {esIngles
                ? 'An honest explanation of WebAssembly GoldSrc emulation and Valve copyright.'
                : 'Una explicación honesta sobre la emulación de GoldSrc con WebAssembly y los derechos de autor de Valve.'}
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-300">
            <p>
              {esIngles
                ? 'Open-source engines like Xash3D FWGS allow the Half-Life 1 engine to run on WebAssembly. However, Valve Corporation strictly protects the copyrighted game assets (levels, sounds, 3D models and textures). For this reason, web emulators cannot legally host the original game data on public servers, and any unauthorized hosting is regularly taken down.'
                : 'Motores de código abierto como Xash3D FWGS permiten compilar el motor GoldSrc en WebAssembly. Sin embargo, Valve Corporation protege estrictamente por derechos de autor los archivos de juego originales (mapas, texturas, modelos y voces). Por este motivo, ningún sitio web puede alojar legalmente los datos del juego completo en servidores públicos, y los enlaces no oficiales son dados de baja con frecuencia.'}
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
              <h4 className="text-orange-400 font-bold text-xs uppercase tracking-wider">
                {esIngles ? 'How to play the classic games today:' : 'Cómo jugar a los clásicos hoy en día:'}
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-400">
                <li>
                  <strong className="text-zinc-200">Half-Life 1 (25th Anniversary Edition en Steam):</strong> La versión oficial y remasterizada por Valve, con soporte 4K, multijugador y compatible con cualquier PC moderna.
                </li>
                <li>
                  <strong className="text-zinc-200">Black Mesa (Steam):</strong> La recreación completa en motor Source con gráficos modernos y los capítulos de Xen completamente reinventados.
                </li>
                <li>
                  <strong className="text-zinc-200">WebXash (Si tienes tus archivos de Steam):</strong> Si posees el juego original en Steam, puedes comprimir tu carpeta <code className="text-orange-400">valve/</code> en un archivo ZIP y montarlo localmente en el proyecto de código abierto de WebXash.
                </li>
              </ul>
            </div>

            <p className="text-xs text-zinc-400">
              {esIngles
                ? 'Because of this, we created our native "Crowbar Strike" mini-game above: it runs directly in your browser with zero downloads, no copyright issues, and authentic Half-Life vibes!'
                : 'Por eso creamos el minijuego nativo «Crowbar Strike» en la pestaña anterior: corre directamente en tu navegador al 100%, sin descargas pesadas, sin errores de enlaces caídos y con todo el espíritu de Black Mesa.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}