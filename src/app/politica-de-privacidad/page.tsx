import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Radar Black Mesa',
  description: 'Política de privacidad, cookies y recopilación de datos de Radar Black Mesa conforme a los estándares de Google AdSense.',
};

export default function PaginaPrivacidad() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12 text-zinc-300 text-left">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 mb-8"
      >
        ← Volver al Radar
      </Link>

      <h1 className="text-3xl font-black text-white mb-6 border-b border-zinc-800 pb-4">
        Política de Privacidad
      </h1>

      <p className="text-xs text-zinc-500 mb-6">
        Última actualización: Noviembre de 2026
      </p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Información general</h2>
          <p>
            En <strong>Radar Black Mesa</strong> (disponible en{' '}
            <a href="https://www.radarblackmesa.online" className="text-orange-400 hover:underline">
              https://www.radarblackmesa.online
            </a>
            ), la privacidad de nuestros visitantes es de suma importancia. Este documento describe los tipos de información personal que se reciben y recopilan al utilizar el sitio, así como su uso y protección.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Archivos de registro y analíticas</h2>
          <p>
            Al igual que muchos otros sitios web, Radar Black Mesa utiliza herramientas de análisis estándar como <strong>Vercel Analytics</strong> para medir el tráfico agregado, el tipo de navegador, páginas visitadas y tiempos de permanencia. Esta información no está vinculada a ningún dato que sea personalmente identificable y se utiliza únicamente con fines estadísticos para optimizar el rendimiento del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Cookies y Publicidad de Google AdSense</h2>
          <p className="mb-2">
            Este sitio web utiliza o puede utilizar servicios publicitarios de terceros, principalmente <strong>Google AdSense</strong>. Google, como proveedor externo, utiliza cookies para publicar anuncios en nuestro sitio:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>
              Google utiliza cookies asociadas con anuncios de Google (como la cookie de DoubleClick) para mostrar anuncios basados en las visitas previas de los usuarios a este sitio web o a otros sitios en Internet.
            </li>
            <li>
              Los usuarios pueden inhabilitar la publicidad personalizada consultando la{' '}
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline"
              >
                Configuración de anuncios de Google
              </a>
              .
            </li>
            <li>
              Para obtener más detalles sobre cómo Google utiliza los datos cuando utiliza los sitios de sus socios, consulte la página:{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline"
              >
                Cómo utiliza Google la información de sitios web o aplicaciones que utilizan nuestros servicios
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Altar de Plegarias e interacción comunitaria</h2>
          <p>
            Los apodos y mensajes dejados voluntariamente por los usuarios en el Altar de Plegarias son de carácter público. Alentamos a los usuarios a no publicar nombres reales completos, correos electrónicos, contraseñas o cualquier dato confidencial. Las direcciones IP se registran temporalmente con el único propósito de prevenir spam automatizado y abusos al sistema de votos y plegarias.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Enlaces a sitios externos</h2>
          <p>
            Radar Black Mesa incluye enlaces a sitios de terceros (como Steam, YouTube, Reddit y comunidades de videojuegos). No nos responsabilizamos por las prácticas de privacidad o los contenidos de dichos sitios web externos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">6. Contacto</h2>
          <p>
            Si tiene alguna pregunta, consulta o inquietud sobre nuestra política de privacidad, puede contactar al administrador del proyecto a través de la sección de{' '}
            <Link href="/sobre-nosotros" className="text-orange-400 hover:underline">
              Sobre Nosotros y Contacto
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
