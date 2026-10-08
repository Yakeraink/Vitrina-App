import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '600', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Vitrina by BrayLabs — Plataforma Comercial SaaS White-Label',
  description:
    'Ecosistema multi-tenant de comercio electrónico de alto nivel. Arquitectura de lujo, aislamiento PostgreSQL RLS y tiendas virtuales de clase mundial.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#18193F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased selection:bg-vitrina-blue selection:text-white bg-[#090a1a] text-slate-100">
        {children}
      </body>
    </html>
  );
}
