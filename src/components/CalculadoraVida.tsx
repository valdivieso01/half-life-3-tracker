'use client';

import { useState } from 'react';
import { Idioma, TRADUCCIONES } from '@/lib/i18n';

interface CalculadoraVidaProps {
  idioma?: Idioma;
}

export function CalculadoraVida({ idioma = 'es' }: CalculadoraVidaProps) {
  const t = TRADUCCIONES[idioma];

  const [anioNacimiento, setAnioNacimiento] = useState('');
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [resultado, setResultado] = useState<{
    edadHoy: number;
    edad2007: number;
    porcentajeVida: number;
    diasEsperando: number;
  } | null>(null);

  const fechaEpisodeTwo = new Date('2007-10-10').getTime();
  const anioActual = new Date().getFullYear();

  function calcular() {
    setError('');
    const anioNum = parseInt(anioNacimiento.trim(), 10);

    if (isNaN(anioNum) || anioNum < 1930 || anioNum > anioActual) {
      setError(t.calculadoraErrorAnio);
      setResultado(null);
      return;
    }

    const fechaNacimiento = new Date(`${anioNum}-07-01`).getTime(); // Usamos mitad de año como promedio
    const ahora = Date.now();

    const diasTotalesVida = Math.max(1, Math.floor((ahora - fechaNacimiento) / (1000 * 60 * 60 * 24)));
    const diasEsperando = Math.floor((ahora - fechaEpisodeTwo) / (1000 * 60 * 60 * 24));

    // Si nació después del 10 de octubre de 2007
    const diasEsperadosReales = Math.min(diasTotalesVida, Math.max(0, diasEsperando));
    const porcentajeVida = Math.min(100, Math.round((diasEsperadosReales / diasTotalesVida) * 100));

    const edadHoy = anioActual - anioNum;
    const edad2007 = Math.max(0, 2007 - anioNum);

    setResultado({
      edadHoy,
      edad2007,
      porcentajeVida,
      diasEsperando,
    });
  }

  function compartirResultado() {
    if (!resultado) return;
    const texto = t.calculadoraTextoShare(
      resultado.porcentajeVida,
      resultado.edadHoy,
      resultado.edad2007
    );

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }

  return (
    <section className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 text-left shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⏳</span>
              <span>{t.calculadoraTitulo}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {t.calculadoraSubtitulo}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg mb-6">
          <input
            type="number"
            min="1930"
            max={anioActual}
            placeholder={t.calculadoraPlaceholderAnio}
            value={anioNacimiento}
            onChange={(e) => setAnioNacimiento(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') calcular();
            }}
            className="bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none flex-1"
          />

          <button
            onClick={calcular}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md whitespace-nowrap"
          >
            {t.calculadoraBotonCalcular}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-4 inline-block">
            {error}
          </p>
        )}

        {resultado && (
          <div className="bg-zinc-950/80 border border-orange-500/30 rounded-xl p-5 sm:p-6 mt-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 text-center sm:text-left">
              <div className="bg-zinc-900/50 border border-zinc-800/80 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  {idioma === 'es' ? '2007 (Episode Two)' : '2007 (Episode Two)'}
                </span>
                <p className="text-base font-bold text-zinc-200">
                  {t.calculadoraTenias(resultado.edad2007)}
                </p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/80 p-3.5 rounded-xl">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  {idioma === 'es' ? 'Actualidad' : 'Today'}
                </span>
                <p className="text-base font-bold text-zinc-200">
                  {t.calculadoraHoyTienes(resultado.edadHoy)}
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 p-3.5 rounded-xl flex flex-col justify-center">
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-0.5">
                  {idioma === 'es' ? 'Porcentaje de tu Vida' : 'Life Waiting'}
                </span>
                <p className="text-2xl sm:text-3xl font-black text-orange-500">
                  {resultado.porcentajeVida}%
                </p>
              </div>
            </div>

            {/* Barra visual de progreso de la vida esperando */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-zinc-400 font-medium mb-1.5">
                <span>{t.calculadoraPorcentaje(resultado.porcentajeVida)}</span>
                <span className="text-orange-400 font-bold">{t.calculadoraDiasTotales(resultado.diasEsperando)}</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  style={{ width: `${resultado.porcentajeVida}%` }}
                  className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-700"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-900">
              <p className="text-xs text-zinc-400 italic">
                &ldquo;{idioma === 'es' ? 'El hombre adecuado en el sitio equivocado puede cambiar el rumbo del mundo.' : 'The right man in the wrong place can make all the difference in the world.'}&rdquo;
              </p>

              <button
                onClick={compartirResultado}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-orange-500/50 text-zinc-200 hover:text-orange-400 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors ml-auto"
              >
                <span>📢</span>
                <span>{copiado ? t.calculadoraCopiado : t.calculadoraCompartir}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
