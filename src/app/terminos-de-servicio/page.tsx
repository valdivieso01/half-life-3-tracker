import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos de Servicio | Radar Black Mesa',
  description: 'Términos y condiciones de uso del sitio web comunitario Radar Black Mesa.',
};

export default function PaginaTerminos() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12 text-zinc-300 text-left">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 mb-8"
      >
        ← Volver al Radar
      </Link>

      <h1 className="text-3xl font-black text-white mb-6 border-b border-zinc-800 pb-4">
        Términos de Servicio y Aviso Legal
      </h1>

      <p className="text-xs text-zinc-500 mb-6">
        Última actualización: Noviembre de 2026
      </p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Naturaleza del sitio</h2>
          <p>
            <strong>Radar Black Mesa</strong> es un proyecto independiente desarrollado por fans con fines exclusivamente informativos, humorísticos y de entretenimiento comunitario. No está afiliado, patrocinado, respaldado ni asociado de ninguna forma con <strong>Valve Corporation</strong> ni con la plataforma <strong>Steam</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Propiedad intelectual y marcas registradas</h2>
          <p>
            <em>Half-Life</em>, <em>Half-Life 2</em>, <em>Half-Life: Alyx</em>, <em>Steam</em>, el logotipo de Steam, el logotipo de Valve y el símbolo Lambda (λ) son marcas comerciales y/o marcas registradas de <strong>Valve Corporation</strong> en los Estados Unidos y otros países. Todas las demás marcas, logotipos y derechos de autor pertenecen a sus respectivos propietarios.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Reglas de uso y conducta en el Altar</h2>
          <p>
            Al utilizar los elementos interactivos del sitio (como el Altar de Plegarias o el contador de cachetadas), el usuario se compromete a no enviar:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400 mt-2">
            <li>Contenido difamatorio, amenazante, abusivo o que incite al odio.</li>
            <li>Spam publicitario, enlaces maliciosos o esquemas fraudulentos.</li>
            <li>Ataques automatizados o scripts para alterar los contadores del servidor.</li>
          </ul>
          <p className="mt-2">
            Nos reservamos el derecho de moderar, ocultar o eliminar cualquier mensaje que viole estas directrices básicas de convivencia.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Exención de responsabilidad</h2>
          <p>
            El estado de los servidores de Steam y las noticias sobre posibles secuelas o filtraciones se proporcionan &ldquo;tal cual&rdquo;, sin garantías de ningún tipo. Radar Black Mesa no se responsabiliza por rumores infundados o fechas no oficiales atribuidas a terceros.
          </p>
        </section>
      </div>
    </main>
  );
}
