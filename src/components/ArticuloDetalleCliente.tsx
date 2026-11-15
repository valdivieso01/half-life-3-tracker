'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticuloHL3 } from '@/lib/articulos';
import { Idioma, obtenerIdiomaInicial, guardarIdioma } from '@/lib/i18n';

interface ArticuloDetalleClienteProps {
  articulo: ArticuloHL3;
}

export function ArticuloDetalleCliente({ articulo }: ArticuloDetalleClienteProps) {
  const [idioma, setIdioma] = useState<Idioma>('es');

  // Cargar idioma guardado en localStorage o detectar idioma del navegador
  useEffect(() => {
    setIdioma(obtenerIdiomaInicial());
  }, []);

  const cambiarIdioma = (nuevoIdioma: Idioma) => {
    setIdioma(nuevoIdioma);
    guardarIdioma(nuevoIdioma);
  };

  const t = articulo[idioma];

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12 text-zinc-300 text-left">
      {/* Barra de navegación superior con selector de idioma */}
      <div className="flex items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300"
        >
          ← {idioma === 'es' ? 'Volver al Radar de Black Mesa' : 'Back to Black Mesa Radar'}
        </Link>

        {/* Selector de idioma ES / EN para el artículo */}
        <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => cambiarIdioma('es')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              idioma === 'es'
                ? 'bg-orange-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => cambiarIdioma('en')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              idioma === 'en'
                ? 'bg-orange-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <article>
        <header className="border-b border-zinc-800 pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
            <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold px-2.5 py-0.5 rounded-full">
              {t.categoria}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">{articulo.fecha}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">{t.tiempoLectura}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
            {t.titulo}
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed mb-4">
            {t.subtitulo}
          </p>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>
              {idioma === 'es' ? 'Por' : 'By'}{' '}
              <strong className="text-zinc-300">{articulo.autor}</strong>
            </span>
          </div>
        </header>

        {/* Resumen destacado */}
        <div className="bg-zinc-900/60 border-l-4 border-orange-500 p-5 rounded-r-xl mb-8 text-sm text-zinc-300 leading-relaxed italic">
          &ldquo;{t.resumen}&rdquo;
        </div>

        {/* Contenido en secciones */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {t.contenido.map((sec, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {sec.seccion}
              </h2>
              {sec.parrafos.map((p, pIdx) => (
                <p key={pIdx} className="text-zinc-300 leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Bloque final de navegación */}
        <div className="mt-14 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors"
          >
            {idioma === 'es' ? 'Verificar estado en vivo de Steam →' : 'Check live Steam status →'}
          </Link>

          <Link
            href="/sobre-nosotros"
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            {idioma === 'es' ? 'Acerca de Radar Black Mesa' : 'About Black Mesa Radar'}
          </Link>
        </div>
      </article>
    </main>
  );
}
