import { NoticiaHL3 } from '@/types/hl3';
import { Idioma, TRADUCCIONES } from '@/lib/i18n';

interface TarjetaNoticiaProps {
  noticia: NoticiaHL3;
  idioma?: Idioma;
}

export function TarjetaNoticia({ noticia, idioma = 'es' }: TarjetaNoticiaProps) {
  const t = TRADUCCIONES[idioma];

  return (
    <a
      href={noticia.link}
      target="_blank"
      rel="noreferrer"
      className="bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl p-4 flex flex-col justify-between transition-all group"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span className="text-orange-400 font-medium">{noticia.fuente}</span>
          <span>{noticia.fecha}</span>
        </div>
        <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-orange-400 transition-colors leading-snug">
          {noticia.titulo}
        </h3>
      </div>

      <span className="text-xs text-zinc-500 mt-4 inline-block">
        {t.leerNotaCompleta}
      </span>
    </a>
  );
}

