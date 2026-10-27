import type { MetadataRoute } from 'next';

/**
 * Next.js genera automáticamente el archivo `/robots.txt` a partir de esta función.
 * Le indica a Googlebot que puede indexar toda la web y dónde está el sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://www.radarblackmesa.online/sitemap.xml',
  };
}

