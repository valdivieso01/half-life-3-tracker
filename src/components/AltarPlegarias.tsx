'use client';

import { useState, useEffect } from 'react';
import { Plegaria } from '@/types/hl3';

export function AltarPlegarias() {
  const [plegarias, setPlegarias] = useState<Plegaria[]>([]);
  const [autor, setAutor] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Nuevo estado para mostrar el mensaje de error si el Backend rechaza por IP (403)
  const [errorIp, setErrorIp] = useState('');

  useEffect(() => {
    fetch('/api/plegarias')
      .then((res) => res.json())
      .then((datos) => setPlegarias(datos))
      .catch((err) => console.error('Error cargando plegarias:', err));
  }, []);

  async function prenderVela() {
    if (mensaje.trim() === '') return;

    try {
      setEnviando(true);
      setErrorIp(''); // Limpiamos errores previos

      const res = await fetch('/api/plegarias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autor: autor.trim() || 'Ciudadano Anónimo',
          mensaje: mensaje.trim(),
        }),
      });

      const datos = await res.json();

      if (!res.ok) {
        // Si el Backend devolvió 403 (IP repetida), mostramos el error en pantalla
        setErrorIp(datos.error || 'No se pudo enviar la plegaria');
        return;
      }

      setPlegarias(datos);
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
      body: JSON.stringify({ id: idPlegaria }),
    });

    const datos = await res.json();

    if (!res.ok) {
      // Si ya le había dado Amén a este comentario desde su IP, mostramos el error
      setErrorIp(datos.error || 'No puedes votar dos veces');
      return;
    }

    setPlegarias(datos);
  }

  return (
    <section className="mt-14 w-full text-left">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
        <h2 className="text-xl font-bold text-zinc-100">
          🕯️ Altar de Plegarias a Gabe Newell ({plegarias.length} velas encendidas)
        </h2>
        <span className="text-xs text-zinc-500">Máx. 1 vela y 1 amén por IP</span>
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

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Tu apodo (ej. Freeman)"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          className="sm:w-48 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
        />

        <input
          type="text"
          placeholder="Escribe tu plegaria o promesa si sale Half-Life 3..."
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
          {enviando ? 'Prendiendo...' : '🕯️ Prender vela'}
        </button>
      </div>

      <div className="space-y-3">
        {plegarias.map((p) => (
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
              🙏 Amén ({p.amenes || 0})
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
