'use client';

import { useState, useEffect } from 'react';
import { NoticiaHL3, RespuestaSteam } from '@/types/hl3';
import { TarjetaNoticia } from '@/components/TarjetaNoticia';
import { AltarPlegarias } from '@/components/AltarPlegarias';

const EXCUSAS_GABE = [
  'Gabe Newell estaba por subir el juego pero se distrajo contando billetes de las rebajas de Steam.',
  'En los teclados de las oficinas de Valve la tecla entre el 2 y el 4 fue reemplazada por "Alyx".',
  'Gordon Freeman perdió la palanca en una mudanza y no pueden arrancar el capítulo 1.',
  'Estaban compilando los shaders pero un Headcrab se metió en el rack del servidor.',
  'Valve confirma que primero lanzarán Counter-Strike 2: Episode Two antes de llegar al 3.',
  'El G-Man puso el repositorio de Git en éxtasis temporal indefinido.',
  'Gabe Newell intentó escribir "3" en el título del proyecto y Windows le tiró pantallazo azul.',
  'Todavía están diseñando gorros nuevos para Team Fortress 2, prioridad absoluta.',
  'El motor Source 3 cobró conciencia propia y pidió trabajar remoto desde Xen.',
  'Barney todavía le debe aquella cerveza a Gordon y hasta que no la pague no arranca la historia.',
  'Se quedaron sin presupuesto después de modelar en 8K cada pelo de la barba de Eli Vance.',
  'El científico que sabía la contraseña del servidor de producción se jubiló en 2011.',
  'Intentaron usar IA para terminar el guion, pero la IA tampoco supo contar hasta 3.',
  'Gabe dijo que por cada vez que alguien pregunte "¿cuándo sale?", lo retrasa un mes más. Ya vamos por el año 2490.',
  'Estaban listos para lanzarlo hoy, pero decidieron rehacer el motor gráfico desde cero por séptima vez.',
  'La Alianza (Combine) bloqueó el puerto 443 de las oficinas de Valve.',
  'Primero tienen que sacar la Steam Deck 2, la Steam Deck 2: Episode One y la Steam Deck: Alyx.',
  'El carrito con el cristal de pruebas se trabó en el sector C de Black Mesa.',
];

export default function HomePage() {
  const [resultado, setResultado] = useState<RespuestaSteam | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [excusaActual, setExcusaActual] = useState('');

  // NUEVO: Segundos de enfriamiento (Cooldown) para evitar spam al botón
  const [enfriamiento, setEnfriamiento] = useState(0);
  const [errorSpam, setErrorSpam] = useState('');

  const [noticias, setNoticias] = useState<NoticiaHL3[]>([]);
  const [cargandoNoticias, setCargandoNoticias] = useState(true);

  const fechaEpisodeTwo = new Date('2007-10-10').getTime();
  const diasEsperando = Math.floor(
    (Date.now() - fechaEpisodeTwo) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    async function cargarNoticias() {
      try {
        const res = await fetch('/api/noticias');
        const datos = await res.json();
        setNoticias(datos);
      } catch (err) {
        console.error('Error cargando noticias:', err);
      } finally {
        setCargandoNoticias(false);
      }
    }
    cargarNoticias();
  }, []);

  // NUEVO: useEffect que descuenta 1 segundo cada 1000ms cuando `enfriamiento > 0`
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

    const res = await fetch('/api/steam');
    const datos = await res.json();

    if (!res.ok) {
      // Si el Backend devuelve 429 (Too Many Requests)
      setErrorSpam(datos.error || 'Espera unos segundos antes de volver a consultar.');
      setConsultando(false);
      return;
    }

    setResultado(datos);

    const indiceAzar = Math.floor(Math.random() * EXCUSAS_GABE.length);
    setExcusaActual(EXCUSAS_GABE[indiceAzar]);

    // Activamos la cuenta regresiva de 10 segundos en el botón
    setEnfriamiento(10);
    setConsultando(false);
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto flex flex-col items-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center text-4xl font-bold text-orange-500 mb-4 shadow-lg shadow-orange-500/10">
        λ
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
        Radar Black Mesa de <span className="text-orange-500">Half-Life 3</span>
      </h1>

      <p className="text-zinc-400 text-sm mb-8">
        Llevamos{' '}
        <strong className="text-orange-400 font-bold">{diasEsperando} días</strong>{' '}
        esperando desde <em>Half-Life 2: Episode Two</em> (2007)
      </p>

      {/* El botón queda deshabilitado mientras consulta O mientras `enfriamiento > 0` */}
      <button
        onClick={preguntarASteam}
        disabled={consultando || enfriamiento > 0}
        className="bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-400 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        {consultando
          ? '📡 Verificando...'
          : enfriamiento > 0
            ? `⏳ Enfriando reactor de Black Mesa (${enfriamiento}s)...`
            : 'λ ¿YA SALIÓ HALF-LIFE 3?'}
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
              ? `⚡ Consultado hoy a las ${resultado.horaConsulta}`
              : `🌐 Consultado en vivo a Steam hoy a las ${resultado.horaConsulta}`}
          </span>

          <p className="text-4xl font-black text-red-500 mb-2">
            {resultado.salio ? '¡SÍ!' : 'NO.'}
          </p>

          <p className="text-zinc-200 font-medium mb-4 italic">
            &ldquo;{excusaActual}&rdquo;
          </p>

          <div className="text-left border-t border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500 mb-2">
              Lo único que devuelve Steam hoy cuando buscas &quot;Half-Life 3&quot;:
            </p>
            <ul className="text-xs text-zinc-400 space-y-1 mb-4">
              {resultado.loQueSiHayEnSteam.map((juego) => (
                <li key={juego.id}>• {juego.nombre}</li>
              ))}
            </ul>
            <p className="text-xs text-orange-400">
              🔥 Total de veces que la humanidad preguntó: {resultado.totalConsultas}
            </p>
          </div>
        </div>
      )}

      <section className="mt-14 w-full text-left">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
          <h2 className="text-xl font-bold text-zinc-100">
            📰 Últimos Rumores y Noticias de Half-Life 3
          </h2>
          <span className="text-xs text-zinc-500">Actualizado 1 vez al día</span>
        </div>

        {cargandoNoticias ? (
          <p className="text-zinc-500 text-sm">Buscando rumores en la red...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {noticias.map((noticia, index) => (
              <TarjetaNoticia key={index} noticia={noticia} />
            ))}
          </div>
        )}
      </section>

      <AltarPlegarias />
    </main>
  );
}
