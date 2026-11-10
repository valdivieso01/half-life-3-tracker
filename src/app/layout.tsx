import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { FooterSitio } from '@/components/FooterSitio';
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
  title: '¿Ya salió Half-Life 3? / Is Half-Life 3 Out Yet? | Radar Black Mesa',
  description:
    'Verificador en tiempo real contra Steam para saber si ya salió Half-Life 3, noticias diarias y Altar de Plegarias a Gabe Newell. Live Steam checker, daily Half-Life 3 rumors & Gabe Newell Prayer Altar.',
  keywords: [
    'ya salio half life 3',
    'cuando sale half life 3',
    'half life 3 noticias',
    'half life 3 rumores',
    'is half life 3 out yet',
    'half life 3 release date',
    'half life 3 news',
    'half life 3 rumors',
    'half life 3 steam tracker',
    'radar black mesa',
    'black mesa radar',
    'gabe newell half life 3',
    'project white sands valve',
    'hlx valve',
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
  other: {
    'google-adsense-account': 'ca-pub-4665232577336299',
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
      {
        '@type': 'Question',
        name: 'Is Half-Life 3 out yet on Steam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not yet. Black Mesa Radar checks the Steam store API daily for Half-Life 3, aggregates the latest daily rumors and news in English and Spanish, and hosts the Gabe Newell Prayer Altar.',
        },
      },
    ],
  };

  return (
    <html lang="es">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4665232577336299"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
        <FooterSitio />
        <Analytics />
      </body>
    </html>
  );
}
