import { NextResponse } from 'next/server';

export interface NoticiaHL3 {
  titulo: string;
  link: string;
  fuente: string;
  fecha: string;
}

let cacheNoticiasDelDia: {
  fechaDia: string;
  noticias: NoticiaHL3[];
} | null = null;

/**
 * PASO 2 (BACKEND): Endpoint GET /api/noticias
 * Descarga las últimas noticias reales sobre "Half-Life 3" desde Google News RSS
 * y las guarda en caché durante todo el día.
 */
export async function GET() {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // 1. Si ya descargamos las noticias hoy, las devolvemos desde el caché en 0ms
    if (cacheNoticiasDelDia && cacheNoticiasDelDia.fechaDia === hoy) {
      return NextResponse.json(cacheNoticiasDelDia.noticias);
    }

    // 2. Consultamos el feed público de Google News buscando "Half-Life 3" en español
    const res = await fetch(
      'https://news.google.com/rss/search?q=%22Half-Life+3%22&hl=es-419&gl=AR&ceid=AR:es-419',
      {
        next: { revalidate: 86400 }, // Caché de 24 horas
      }
    );
    const xml = await res.text();

    // Extraemos los bloques <item>...</item> del XML de noticias
    const itemsXml = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const noticias: NoticiaHL3[] = itemsXml.slice(0, 6).map((item) => {
      const tituloCrudo = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Noticia de Half-Life 3';
      // Google News suele poner "Título de la nota - Nombre del Diario", quitamos el sufijo
      const titulo = tituloCrudo
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/ - [^-]+$/, '')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || 'https://news.google.com';
      const fuente = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Portal Gamer';
      const fechaPub = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];

      const fechaFormateada = fechaPub
        ? new Date(fechaPub).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : hoy;

      return {
        titulo,
        link,
        fuente,
        fecha: fechaFormateada,
      };
    });

    cacheNoticiasDelDia = {
      fechaDia: hoy,
      noticias,
    };

    return NextResponse.json(noticias);
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    return NextResponse.json([], { status: 500 });
  }
}

