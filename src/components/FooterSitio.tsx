import Link from 'next/link';

export function FooterSitio() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="w-full max-w-[1560px] mx-auto border-t border-zinc-800/80 mt-20 pt-10 pb-14 px-6 md:px-10 text-xs text-zinc-500 text-center">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-left">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-2 font-bold text-orange-500">
            <span className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500 flex items-center justify-center text-xs">
              λ
            </span>
            <span className="text-zinc-200">Radar Black Mesa</span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            Portal comunitario independiente de seguimiento en tiempo real sobre Half-Life 3, datamining de Source 2 y archivo histórico de la espera iniciada tras el lanzamiento de Episode Two en 2007.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-zinc-400 font-medium">
          <Link
            href="/sobre-nosotros"
            className="hover:text-orange-400 transition-colors"
          >
            Sobre Nosotros & Contacto
          </Link>
          <Link
            href="/politica-de-privacidad"
            className="hover:text-orange-400 transition-colors"
          >
            Política de Privacidad
          </Link>
          <Link
            href="/terminos-de-servicio"
            className="hover:text-orange-400 transition-colors"
          >
            Términos de Servicio
          </Link>
        </div>
      </div>

      <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
        <p>
          © {anioActual} Radar Black Mesa. Creado con devoción para la comunidad de Half-Life.
        </p>
        <p>
          Half-Life, Steam y el logotipo de Valve son marcas registradas de Valve Corporation. Este sitio no está afiliado a Valve.
        </p>
      </div>
    </footer>
  );
}
