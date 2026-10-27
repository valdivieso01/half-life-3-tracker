import type { Metadata } from 'next';
// @ts-ignore -- CSS modules are provided by the Next.js build pipeline.
import './globals.css';

export const metadata: Metadata = {
  title: 'λ ¿Ya salió Half-Life 3?',
  description: 'Verificador en tiempo real contra la API de Steam y noticias de Half-Life 3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}

