import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SaaS White-Label E-Commerce Platform',
  description: 'Enterprise Multi-Tenant SaaS E-commerce Platform with PostgreSQL RLS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">{children}</body>
    </html>
  );
}
