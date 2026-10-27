import { NextResponse } from 'next/server';

export interface NoticiaHL3 {
  titulo: string;
  link: string;
  fuente: string;
  fecha: string;
}

const cacheNoticiasPorIdioma: Record<
  string,
  {
    fechaDia: string;
    noticias: NoticiaHL3[];
  }
> = {};

/**
 * PASO 2 (BACKEND): Endpoint GET /api/noticias?lang=es|en
 * Descarga las últimas noticias reales sobre "Half-Life 3" desde Google News RSS
 * en español o en inglés y las guarda en caché durante todo el día por idioma.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'es';
    const hoy = new Date().toISOString().split('T')[0];

    // 1. Si ya descargamos las noticias de este idioma hoy, las devolvemos desde el caché en 0ms
    const cacheActual = cacheNoticiasPorIdioma[lang];
    if (cacheActual && cacheActual.fechaDia === hoy) {
      return NextResponse.json(cacheActual.noticias);
    }

    // 2. Consultamos el feed público de Google News buscando "Half-Life 3" en el idioma pedido
    const urlRss =
      lang === 'en'
        ? 'https://news.google.com/rss/search?q=%22Half-Life+3%22&hl=en-US&gl=US&ceid=US:en'
        : 'https://news.google.com/rss/search?q=%22Half-Life+3%22&hl=es-419&gl=AR&ceid=AR:es-419';

    const res = await fetch(urlRss, {
      next: { revalidate: 86400 }, // Caché de 24 horas
    });
    const xml = await res.text();

    // Extraemos los bloques <item>...</item> del XML de noticias
    const itemsXml = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const noticias: NoticiaHL3[] = itemsXml.slice(0, 6).map((item) => {
      const tituloCrudo = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Half-Life 3 News';
      // Google News suele poner "Título de la nota - Nombre del Diario", quitamos el sufijo
      const titulo = tituloCrudo
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/ - [^-]+$/, '')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || 'https://news.google.com';
      const fuente = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Gaming News';
      const fechaPub = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];

      const localeFecha = lang === 'en' ? 'en-US' : 'es-AR';
      const fechaFormateada = fechaPub
        ? new Date(fechaPub).toLocaleDateString(localeFecha, {
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

    cacheNoticiasPorIdioma[lang] = {
      fechaDia: hoy,
      noticias,
    };

    return NextResponse.json(noticias);
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    return NextResponse.json([], { status: 500 });
  }
}

