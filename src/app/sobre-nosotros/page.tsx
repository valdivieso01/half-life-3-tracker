import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre Nosotros y Contacto | Radar Black Mesa',
  description: 'Conoce qué es Radar Black Mesa, la historia del proyecto y cómo contactar con el creador.',
};

export default function PaginaSobreNosotros() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12 text-zinc-300 text-left">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 mb-8"
      >
        ← Volver al Radar
      </Link>

      <h1 className="text-3xl font-black text-white mb-6 border-b border-zinc-800 pb-4">
        Sobre Nosotros & Contacto
      </h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-orange-400 mb-3">
            ¿Qué es Radar Black Mesa?
          </h2>
          <p className="mb-3">
            <strong>Radar Black Mesa</strong> nació como un tributo comunitario y satírico a una de las esperas más legendarias en la historia de los videojuegos: la continuación directa de <em>Half-Life 2: Episode Two</em> (publicado originalmente el 10 de octubre de 2007).
          </p>
          <p className="mb-3">
            La plataforma combina:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400 mb-4">
            <li><strong>Verificador técnico diario de la API pública de Steam</strong>: Detecta de forma transparente si Valve añade algún juego o producto bajo el nombre &ldquo;Half-Life 3&rdquo;.</li>
            <li><strong>Cronología histórica documentada</strong>: Recopila los anuncios oficiales, filtraciones reales de código en Source 2 (*Project White Sands*, *HLX*) y testimonios de desarrolladores desde 2007 hasta la actualidad.</li>
            <li><strong>Espacio interactivo comunitario</strong>: El Altar de Plegarias a Gabe Newell y el desquitador de cachetadas global, donde miles de jugadores comparten promesas y humor sobre la espera.</li>
            <li><strong>Directorio curado de fuentes</strong>: Apoya la labor de archivistas y dataminers independientes de la comunidad como SteamDB, Tyler McVicker y Combine OverWiki.</li>
          </ul>
        </section>

        <section className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-2">
            El Creador y Misión
          </h2>
          <p className="text-zinc-400 mb-4">
            El proyecto fue creado y es mantenido de forma independiente por <strong>Javier Valdivieso</strong>, desarrollador de software y fan de la saga desde los tiempos del Half-Life original en 1998. El objetivo es brindar un punto de encuentro fidedigno, sin clickbait tóxico, que celebre la rica historia y la apasionada comunidad de Valve.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="bg-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300 font-mono">
              GitHub: <a href="https://github.com/valdivieso01/half-life-3-tracker" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">valdivieso01/half-life-3-tracker</a>
            </span>
            <span className="bg-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300 font-mono">
              Ubicación: Mendoza, Argentina
            </span>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            Contacto y Sugerencias
          </h2>
          <p className="mb-2">
            ¿Encontraste una filtración nueva verificada? ¿Tienes sugerencias para el sitio o necesitas reportar un problema de derechos o privacidad?
          </p>
          <p>
            Puedes comunicarte por correo electrónico directamente a:{' '}
            <a
              href="mailto:hjavier.valdivieso@outlook.es"
              className="text-orange-400 font-bold hover:underline"
            >
              hjavier.valdivieso@outlook.es
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
