import Link from 'next/link';
import { getSessionContext } from '@/lib/tenant/context';

export default async function HomePage() {
  const context = await getSessionContext();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12">
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center py-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-bold text-emerald-400">
            TV
          </div>
          <span className="font-semibold text-lg tracking-tight">SaaS White-Label Core</span>
        </div>
        <nav>
          {context ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition"
            >
              Ir al Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition"
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </header>

      <section className="max-w-4xl mx-auto w-full text-center py-20 space-y-6">
        <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-widest">
          Fase 1: Core SaaS + PostgreSQL RLS Activo
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Arquitectura Multi-Tenant de Grado Empresarial
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          Núcleo multi-inquilino de alto rendimiento para tiendas virtuales White-Label. Aislamiento
          criptográfico de sesiones, derivación de contexto server-side y control estricto de acceso
          con PostgreSQL Row-Level Security (RLS).
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-emerald-900/40"
          >
            Acceso al Sistema
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 border border-slate-700 hover:border-slate-600 text-slate-300 font-medium rounded-lg text-sm transition"
          >
            Documentación Técnica
          </a>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto w-full py-6 border-t border-slate-900 text-slate-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div>Plataforma Comercial SaaS White-Label &copy; 2026. Todos los derechos reservados.</div>
        <div className="flex gap-4">
          <span className="text-emerald-400/80">● RLS Enforced</span>
          <span>● Clean Architecture</span>
          <span>● Anti-IDOR Guard</span>
        </div>
      </footer>
    </main>
  );
}
