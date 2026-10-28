'use client';

import { useState, useEffect } from 'react';
import { Plegaria, RespuestaPlegariasPaginadas } from '@/types/hl3';
import { Idioma, TRADUCCIONES } from '@/lib/i18n';

const POR_PAGINA = 4;

interface AltarPlegariasProps {
  idioma?: Idioma;
}

export function AltarPlegarias({ idioma = 'es' }: AltarPlegariasProps) {
  const t = TRADUCCIONES[idioma];
  const [plegarias, setPlegarias] = useState<Plegaria[]>([]);
  const [totalVelas, setTotalVelas] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargandoPagina, setCargandoPagina] = useState(false);

  const [autor, setAutor] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorIp, setErrorIp] = useState('');

  // Estados para el buscador por usuario
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [filtroAutorActivo, setFiltroAutorActivo] = useState('');

  // Función que sincroniza el estado de React con la respuesta paginada del Backend
  function aplicarRespuestaPaginada(datos: RespuestaPlegariasPaginadas) {
    setPlegarias(datos.plegarias || []);
    setTotalVelas(datos.total || 0);
    setPaginaActual(datos.paginaActual || 1);
    setTotalPaginas(datos.totalPaginas || 1);
  }

  // Cada vez que cambia `paginaActual` o `filtroAutorActivo`, consultamos al Backend
  useEffect(() => {
    setCargandoPagina(true);
    const params = new URLSearchParams({
      page: String(paginaActual),
      limit: String(POR_PAGINA),
    });
    if (filtroAutorActivo.trim()) {
      params.set('autor', filtroAutorActivo.trim());
    }

    fetch(`/api/plegarias?${params.toString()}`)
      .then((res) => res.json())
      .then((datos: RespuestaPlegariasPaginadas) => {
        aplicarRespuestaPaginada(datos);
      })
      .catch((err) => console.error('Error cargando plegarias:', err))
      .finally(() => setCargandoPagina(false));
  }, [paginaActual, filtroAutorActivo]);

  function ejecutarBusqueda() {
    setPaginaActual(1);
    setFiltroAutorActivo(textoBusqueda.trim());
  }

  function limpiarBusqueda() {
    setTextoBusqueda('');
    setPaginaActual(1);
    setFiltroAutorActivo('');
  }

  async function prenderVela() {
    if (mensaje.trim() === '') return;

    try {
      setEnviando(true);
      setErrorIp('');

      const res = await fetch('/api/plegarias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autor: autor.trim() || t.apodoAnonimo,
          mensaje: mensaje.trim(),
          lang: idioma,
        }),
      });

      const datos = await res.json();

      if (!res.ok) {
        setErrorIp(datos.error || 'No se pudo enviar la plegaria');
        return;
      }

      // Al crear una vela nueva, limpiamos el filtro de búsqueda y mostramos la página 1
      setTextoBusqueda('');
      setFiltroAutorActivo('');
      aplicarRespuestaPaginada(datos);
      setMensaje('');
    } finally {
      setEnviando(false);
    }
  }

  async function darAmen(idPlegaria: number) {
    setErrorIp('');

    const res = await fetch('/api/plegarias', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: idPlegaria,
        pagina: paginaActual,
        busquedaAutor: filtroAutorActivo,
        lang: idioma,
      }),
    });

    const datos = await res.json();

    if (!res.ok) {
      setErrorIp(datos.error || 'No puedes votar dos veces');
      return;
    }

    aplicarRespuestaPaginada(datos);
  }

  function irAPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    setPaginaActual(nuevaPagina);
  }

  return (
    <section className="mt-14 w-full text-left">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
        <h2 className="text-xl font-bold text-zinc-100">
          {t.altarTitulo(totalVelas)}
        </h2>
      </div>

      {/* Alerta roja cuando el Backend bloquea por IP repetida */}
      {errorIp && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{errorIp}</span>
          <button
            onClick={() => setErrorIp('')}
            className="text-red-300 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder={t.placeholderApodo}
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          className="sm:w-48 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
        />

        <input
          type="text"
          placeholder={t.placeholderMensaje}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') prenderVela();
          }}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
        />

        <button
          onClick={prenderVela}
          disabled={enviando}
          className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-lg cursor-pointer whitespace-nowrap"
        >
          {enviando ? t.botonPrendiendo : t.botonPrenderVela}
        </button>
      </div>

      {/* Buscador de mensajes por usuario (consulta SQL con ILIKE) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t.placeholderBuscarUsuario}
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') ejecutarBusqueda();
            }}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={ejecutarBusqueda}
            disabled={cargandoPagina}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs px-4 py-2 rounded-lg border border-zinc-700 cursor-pointer transition-colors whitespace-nowrap"
          >
            {t.botonBuscarUsuario}
          </button>

          {filtroAutorActivo && (
            <button
              onClick={limpiarBusqueda}
              className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
            >
              {t.botonVerTodos}
            </button>
          )}
        </div>
      </div>

      {/* Lista de plegarias de la página actual */}
      <div className={`space-y-3 transition-opacity ${cargandoPagina ? 'opacity-50' : 'opacity-100'}`}>
        {plegarias.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-6 text-center text-sm text-zinc-500">
            {t.sinResultadosUsuario}{' '}
            <strong className="text-zinc-300">&quot;{filtroAutorActivo}&quot;</strong>.
          </div>
        ) : (
          plegarias.map((p) => (
            <div
              key={p.id}
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">🕯️</span>
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    <strong className="text-orange-400">{p.autor}</strong>
                    <span>• {p.fecha}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{p.mensaje}</p>
                </div>
              </div>

              <button
                onClick={() => darAmen(p.id)}
                className="bg-zinc-800 hover:bg-orange-500/20 hover:text-orange-400 border border-zinc-700 hover:border-orange-500/40 text-zinc-300 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
              >
                {t.botonAmen} ({p.amenes || 0})
              </button>
            </div>
          ))
        )}
      </div>

      {/* Controles de Paginación */}
      <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
        <button
          onClick={() => irAPagina(paginaActual - 1)}
          disabled={paginaActual <= 1 || cargandoPagina}
          className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-800 text-zinc-200 font-medium px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
        >
          {t.paginacionAnterior}
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPaginas }, (_, idx) => idx + 1).map((numPagina) => (
            <button
              key={numPagina}
              onClick={() => irAPagina(numPagina)}
              disabled={cargandoPagina}
              className={`w-8 h-8 rounded-lg font-semibold cursor-pointer transition-colors ${
                numPagina === paginaActual
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              {numPagina}
            </button>
          ))}
        </div>

        <button
          onClick={() => irAPagina(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas || cargandoPagina}
          className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-800 text-zinc-200 font-medium px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
        >
          {t.paginacionSiguiente}
        </button>
      </div>
    </section>
  );
}
