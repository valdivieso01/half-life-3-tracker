import type { MetadataRoute } from 'next';

/**
 * Next.js genera automáticamente `/sitemap.xml` a partir de esta función.
 * Como las noticias cambian 1 vez al día, le avisamos a Google con `changeFrequency: 'daily'`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.radarblackmesa.online',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}

