import { Idioma, TRADUCCIONES } from '@/lib/i18n';

interface SeccionFuentesProps {
  idioma?: Idioma;
}

export function SeccionFuentes({ idioma = 'es' }: SeccionFuentesProps) {
  const t = TRADUCCIONES[idioma];

  return (
    <section className="w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 mb-6 gap-2">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>🕵️</span>
            <span>{t.fuentesTitulo}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">{t.fuentesSubtitulo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {t.fuentesLista.map((fuente) => (
          <a
            key={fuente.nombre}
            href={fuente.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  {fuente.badge}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">{fuente.canal}</span>
              </div>

              <h3 className="text-base font-bold text-zinc-100 group-hover:text-orange-400 transition-colors mb-1">
                {fuente.nombre}
              </h3>

              <p className="text-xs font-semibold text-zinc-400 mb-2">
                {fuente.rol}
              </p>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {fuente.descripcion}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                {t.fuentesBotonVisitar}
              </span>
              <span className="text-zinc-600 group-hover:text-orange-400 text-sm transition-colors">
                ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
