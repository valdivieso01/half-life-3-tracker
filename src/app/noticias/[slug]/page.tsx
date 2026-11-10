import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICULOS_EDITORIALES } from '@/lib/articulos';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return ARTICULOS_EDITORIALES.map((articulo) => ({
    slug: articulo.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const articulo = ARTICULOS_EDITORIALES.find((a) => a.slug === slug);

  if (!articulo) {
    return {
      title: 'Artículo no encontrado | Radar Black Mesa',
    };
  }

  return {
    title: `${articulo.titulo} | Radar Black Mesa`,
    description: articulo.resumen,
    openGraph: {
      title: articulo.titulo,
      description: articulo.resumen,
      type: 'article',
      publishedTime: '2026-11-01',
      authors: [articulo.autor],
    },
  };
}

export default async function PaginaDetalleArticulo({ params }: Props) {
  const { slug } = await params;
  const articulo = ARTICULOS_EDITORIALES.find((a) => a.slug === slug);

  if (!articulo) {
    notFound();
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12 text-zinc-300 text-left">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 mb-8"
      >
        ← Volver al Radar de Black Mesa
      </Link>

      <article>
        <header className="border-b border-zinc-800 pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
            <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold px-2.5 py-0.5 rounded-full">
              {articulo.categoria}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">{articulo.fecha}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">{articulo.tiempoLectura}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
            {articulo.titulo}
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed mb-4">
            {articulo.subtitulo}
          </p>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Por <strong className="text-zinc-300">{articulo.autor}</strong></span>
          </div>
        </header>

        {/* Resumen destacado */}
        <div className="bg-zinc-900/60 border-l-4 border-orange-500 p-5 rounded-r-xl mb-8 text-sm text-zinc-300 leading-relaxed italic">
          &ldquo;{articulo.resumen}&rdquo;
        </div>

        {/* Contenido en secciones */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {articulo.contenido.map((sec, idx) => (
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
            Verificar estado en vivo de Steam →
          </Link>

          <Link
            href="/sobre-nosotros"
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            Acerca de Radar Black Mesa
          </Link>
        </div>
      </article>
    </main>
  );
}
