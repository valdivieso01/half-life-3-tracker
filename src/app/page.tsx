'use client';

import { useState, useEffect } from 'react';
import { NoticiaHL3, RespuestaSteam } from '@/types/hl3';
import { TarjetaNoticia } from '@/components/TarjetaNoticia';
import { AltarPlegarias } from '@/components/AltarPlegarias';
import { PanelCachetadaGabe } from '@/components/PanelCachetadaGabe';
import { Idioma, TRADUCCIONES } from '@/lib/i18n';

export default function HomePage() {
  const [idioma, setIdioma] = useState<Idioma>('es');
  const t = TRADUCCIONES[idioma];

  const [resultado, setResultado] = useState<RespuestaSteam | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [indiceExcusa, setIndiceExcusa] = useState(0);

  // Segundos de enfriamiento (Cooldown) para evitar spam al botón
  const [enfriamiento, setEnfriamiento] = useState(0);
  const [errorSpam, setErrorSpam] = useState('');

  const [noticias, setNoticias] = useState<NoticiaHL3[]>([]);
  const [cargandoNoticias, setCargandoNoticias] = useState(true);

  const fechaEpisodeTwo = new Date('2007-10-10').getTime();
  const diasEsperando = Math.floor(
    (Date.now() - fechaEpisodeTwo) / (1000 * 60 * 60 * 24)
  );

  // Detectar idioma del navegador al entrar por primera vez
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')) {
      setIdioma('en');
    }
  }, []);

  // Recargar noticias en el idioma seleccionado (ES o EN)
  useEffect(() => {
    async function cargarNoticias() {
      setCargandoNoticias(true);
      try {
        const res = await fetch(`/api/noticias?lang=${idioma}`);
        const datos = await res.json();
        setNoticias(datos);
      } catch (err) {
        console.error('Error cargando noticias:', err);
      } finally {
        setCargandoNoticias(false);
      }
    }
    cargarNoticias();
  }, [idioma]);

  // Descuenta 1 segundo cada 1000ms cuando `enfriamiento > 0`
  useEffect(() => {
    if (enfriamiento <= 0) return;

    const timer = setTimeout(() => {
      setEnfriamiento(enfriamiento - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [enfriamiento]);

  async function preguntarASteam() {
    setConsultando(true);
    setErrorSpam('');

    const res = await fetch(`/api/steam?lang=${idioma}`);
    const datos = await res.json();

    if (!res.ok) {
      setErrorSpam(datos.error || t.errorSpamDefault);
      setConsultando(false);
      return;
    }

    setResultado(datos);

    const indiceAzar = Math.floor(Math.random() * t.excusasGabe.length);
    setIndiceExcusa(indiceAzar);

    // Activamos la cuenta regresiva de 10 segundos en el botón
    setEnfriamiento(10);
    setConsultando(false);
  }

  const excusaActual = t.excusasGabe[indiceExcusa] || t.excusasGabe[0];

  return (
    <main className="relative min-h-screen w-full max-w-[1560px] mx-auto flex flex-col items-center py-8 px-6 md:px-10 xl:px-14 text-center">
      {/* Selector de idioma ES / EN */}
      <div className="w-full flex justify-end mb-4">
        <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setIdioma('es')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              idioma === 'es'
                ? 'bg-orange-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setIdioma('en')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              idioma === 'en'
                ? 'bg-orange-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Cabecera en 3 columnas en PC: columna vacía a la izq + Radar centrado al medio + Stress Reliever a la derecha (sin pisar lo de abajo) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8">
        <div className="hidden lg:block" />

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center text-4xl font-bold text-orange-500 mb-4 shadow-lg shadow-orange-500/10">
            λ
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            {t.tituloPrincipal} <span className="text-orange-500">Half-Life 3</span>
          </h1>

          <p className="text-zinc-400 text-sm mb-8">
            {t.diasEsperandoPrefijo}{' '}
            <strong className="text-orange-400 font-bold">
              {diasEsperando} {t.diasPalabra}
            </strong>{' '}
            {t.diasEsperandoSufijo} <em>Half-Life 2: Episode Two</em> (2007)
          </p>

          {/* El botón queda deshabilitado mientras consulta O mientras `enfriamiento > 0` */}
          <button
            onClick={preguntarASteam}
            disabled={consultando || enfriamiento > 0}
            className="bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-400 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            {consultando
              ? t.botonVerificando
              : enfriamiento > 0
                ? t.botonEnfriando(enfriamiento)
                : t.botonPreguntar}
          </button>

          {errorSpam && (
            <p className="mt-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
              {errorSpam}
            </p>
          )}

          {resultado && (
            <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full">
              <span
                className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-3 ${
                  resultado.desdeCache
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                }`}
              >
                {resultado.desdeCache
                  ? t.badgeCache(resultado.horaConsulta)
                  : t.badgeVivo(resultado.horaConsulta)}
              </span>

              <p className="text-4xl font-black text-red-500 mb-2">
                {resultado.salio ? t.respuestaSi : t.respuestaNo}
              </p>

              <p className="text-zinc-200 font-medium mb-4 italic">
                &ldquo;{excusaActual}&rdquo;
              </p>

              <div className="text-left border-t border-zinc-800 pt-4">
                <p className="text-xs text-zinc-500 mb-2">{t.loQueHayEnSteam}</p>
                <ul className="text-xs text-zinc-400 space-y-1 mb-4">
                  {resultado.loQueSiHayEnSteam.map((juego) => (
                    <li key={juego.id}>• {juego.nombre}</li>
                  ))}
                </ul>
                <p className="text-xs text-orange-400">
                  {t.totalConsultas} {resultado.totalConsultas}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center lg:justify-end">
          <PanelCachetadaGabe idioma={idioma} />
        </div>
      </div>

      {/* Grilla de 2 columnas en escritorio: Noticias a la izquierda y Altar a la derecha */}
      <div className="mt-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start">
        <section className="w-full text-left">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
            <h2 className="text-xl font-bold text-zinc-100">{t.tituloNoticias}</h2>
            <span className="text-xs text-zinc-500">{t.actualizadoDiario}</span>
          </div>

          {cargandoNoticias ? (
            <p className="text-zinc-500 text-sm">{t.buscandoNoticias}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {noticias.map((noticia, index) => (
                <TarjetaNoticia key={index} noticia={noticia} idioma={idioma} />
              ))}
            </div>
          )}
        </section>

        <AltarPlegarias idioma={idioma} />
      </div>
    </main>
  );
}
