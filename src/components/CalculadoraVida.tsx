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

    const fechaNacimiento = new Date(`${anioNum}-07-01`).getTime();
    const ahora = Date.now();

    const diasTotalesVida = Math.max(1, Math.floor((ahora - fechaNacimiento) / (1000 * 60 * 60 * 24)));
    const diasEsperando = Math.floor((ahora - fechaEpisodeTwo) / (1000 * 60 * 60 * 24));

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
    <aside className="w-full max-w-[280px] bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-xl text-left select-none">
      <div className="mb-3 text-center sm:text-left">
        <h3 className="text-sm font-bold text-orange-400 flex items-center justify-center sm:justify-start gap-1.5">
          <span>⏳</span>
          <span>{t.calculadoraTitulo}</span>
        </h3>
        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
          {t.calculadoraSubtitulo}
        </p>
      </div>

      <div className="flex flex-col gap-2">
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
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
        />

        <button
          onClick={calcular}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer shadow-md"
        >
          {t.calculadoraBotonCalcular}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1.5 rounded-lg">
          {error}
        </p>
      )}

      {resultado && (
        <div className="mt-3 pt-3 border-t border-zinc-800/80 animate-in fade-in space-y-2.5">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">
                {idioma === 'es' ? 'En 2007 vs Hoy' : 'In 2007 vs Today'}
              </span>
              <span className="text-xs font-semibold text-zinc-200">
                {resultado.edad2007} {idioma === 'es' ? 'años' : 'yrs'} → {resultado.edadHoy} {idioma === 'es' ? 'años' : 'yrs'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-orange-500 block leading-tight">
                {resultado.porcentajeVida}%
              </span>
              <span className="text-[9px] text-orange-400/80 font-medium block">
                {idioma === 'es' ? 'de tu vida' : 'of your life'}
              </span>
            </div>
          </div>

          <div>
            <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                style={{ width: `${resultado.porcentajeVida}%` }}
                className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-700"
              />
            </div>
          </div>

          <button
            onClick={compartirResultado}
            className="w-full flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-200 hover:text-orange-400 text-[11px] font-semibold py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <span>📢</span>
            <span>{copiado ? t.calculadoraCopiado : t.calculadoraCompartir}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
