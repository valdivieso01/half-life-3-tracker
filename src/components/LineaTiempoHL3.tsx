import { Idioma, TRADUCCIONES } from '@/lib/i18n';

interface LineaTiempoHL3Props {
  idioma?: Idioma;
}

export function LineaTiempoHL3({ idioma = 'es' }: LineaTiempoHL3Props) {
  const t = TRADUCCIONES[idioma];

  return (
    <section className="w-full max-w-4xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 mb-8 gap-2">
        <h2 className="text-xl font-bold text-zinc-100">{t.timelineTitulo}</h2>
        <span className="text-xs text-zinc-500">{t.timelineSubtitulo}</span>
      </div>

      <div className="relative border-l-2 border-orange-500/40 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
        {t.hitosLineaTiempo.map((hito, idx) => (
          <div
            key={idx}
            className="relative bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-2xl p-5 transition-all group"
          >
            {/* Nodo circular luminoso sobre la línea vertical */}
            <span className="absolute -left-[33px] sm:-left-[41px] top-6 w-4 h-4 rounded-full bg-zinc-950 border-2 border-orange-500 group-hover:scale-125 group-hover:bg-orange-500 transition-all shadow-md shadow-orange-500/30" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-sm font-extrabold text-orange-400 tracking-wide">
                {hito.anio}
              </span>
              <span className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                {hito.categoria}
              </span>
            </div>

            <h3 className="text-base font-bold text-zinc-100 mb-2">
              {hito.titulo}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
              {hito.descripcion}
            </p>

            {/* Barra de Nivel de Esperanza */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                <span>{t.timelineNivelEsperanza}</span>
                <strong
                  className={
                    hito.esperanza >= 80
                      ? 'text-emerald-400'
                      : hito.esperanza <= 25
                        ? 'text-red-400'
                        : 'text-orange-400'
                  }
                >
                  {hito.esperanza}%
                </strong>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  style={{ width: `${hito.esperanza}%` }}
                  className={`h-full rounded-full transition-all ${
                    hito.esperanza >= 80
                      ? 'bg-emerald-500'
                      : hito.esperanza <= 25
                        ? 'bg-red-500'
                        : 'bg-orange-500'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
