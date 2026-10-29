import { Idioma, TRADUCCIONES } from '@/lib/i18n';

interface SeccionQueJugarProps {
  idioma?: Idioma;
}

export function SeccionQueJugar({ idioma = 'es' }: SeccionQueJugarProps) {
  const t = TRADUCCIONES[idioma];

  return (
    <section className="w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 mb-6 gap-2">
        <h2 className="text-xl font-bold text-zinc-100">{t.queJugarTitulo}</h2>
        <span className="text-xs text-zinc-500">{t.queJugarSubtitulo}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {t.juegosRecomendados.map((juego) => (
          <a
            key={juego.appId}
            href={`https://store.steampowered.com/app/${juego.appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl overflow-hidden flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="relative aspect-[460/215] w-full overflow-hidden bg-zinc-950">
                <img
                  src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${juego.appId}/header.jpg`}
                  alt={juego.nombre}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 bg-zinc-950/90 border border-orange-500/40 text-orange-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  {juego.etiqueta}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-orange-400 transition-colors mb-1.5">
                  {juego.nombre}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {juego.descripcion}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-1">
              <span className="text-xs font-semibold text-orange-400 group-hover:underline">
                {t.verEnSteam}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

