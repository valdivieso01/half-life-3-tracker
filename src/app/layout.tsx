import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
// @ts-ignore -- CSS modules are provided by the Next.js build pipeline.
import './globals.css';

const URL_SITIO = 'https://www.radarblackmesa.online';

/**
 * METADATA SEO DE NEXT.JS (src/app/layout.tsx)
 * Next.js convierte este objeto automáticamente en etiquetas <title>, <meta name="description">,
 * OpenGraph (para WhatsApp/Discord) y Twitter Cards en el <head> del HTML.
 */
export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: '¿Ya salió Half-Life 3? | Radar Black Mesa y Noticias en Vivo',
  description:
    'Verificador en tiempo real contra la API de Steam para saber si ya salió Half-Life 3, contador de días desde Episode Two (2007), últimos rumores y el Altar de Plegarias a Gabe Newell.',
  keywords: [
    'ya salio half life 3',
    'cuando sale half life 3',
    'half life 3 noticias',
    'half life 3 rumores',
    'half life 3 steam',
    'radar black mesa',
    'gabe newell half life 3',
    'project white sands valve',
  ],
  authors: [{ name: 'Javier - Radar Black Mesa' }],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    title: 'λ ¿Ya salió Half-Life 3? | Radar Black Mesa',
    description:
      'Consulta en directo a los servidores de Steam, lee los últimos rumores del día y prende tu vela en el Altar de Gabe Newell.',
    url: URL_SITIO,
    siteName: 'Radar Black Mesa - Half-Life 3 Tracker',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'λ ¿Ya salió Half-Life 3? | Radar Black Mesa',
    description:
      'Verificador diario contra Steam, noticias de Half-Life 3 y Altar de Plegarias a Gabe Newell.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Datos Estructurados JSON-LD (Schema.org) para que Google entienda de qué trata la web
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Ya salió Half-Life 3 en Steam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Todavía no. Radar Black Mesa verifica automáticamente todos los días la tienda de Steam buscando Half-Life 3 y recopila las últimas noticias y rumores en español.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto tiempo pasó desde el último Half-Life?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Half-Life 2: Episode Two se lanzó el 10 de octubre de 2007. La comunidad lleva más de 18 años esperando la continuación directa de la historia de Gordon Freeman.',
        },
      },
    ],
  };

  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
