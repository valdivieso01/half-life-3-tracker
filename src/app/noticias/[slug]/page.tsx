import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARTICULOS_EDITORIALES } from '@/lib/articulos';
import { ArticuloDetalleCliente } from '@/components/ArticuloDetalleCliente';

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
    title: `${articulo.es.titulo} / ${articulo.en.titulo} | Radar Black Mesa`,
    description: articulo.es.resumen,
    openGraph: {
      title: articulo.es.titulo,
      description: articulo.es.resumen,
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

  return <ArticuloDetalleCliente articulo={articulo} />;
}
