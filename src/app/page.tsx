import Link from 'next/link';
import { getSessionContext } from '@/lib/tenant/context';
import { VitrinaLogo } from '@/components/brand/VitrinaLogo';

export default async function HomePage() {
  const context = await getSessionContext();

  return (
    <main className="min-h-screen bg-[#090A1A] text-slate-100 selection:bg-vitrina-blue selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Ambient Glows (Apple Keynote Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#3F44CD]/25 via-[#18193F]/15 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[400px] -left-[200px] w-[500px] h-[500px] bg-[#3F44CD]/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] -right-[200px] w-[600px] h-[600px] bg-[#E5DEC9]/5 blur-[160px] pointer-events-none -z-10" />

      {/* Floating Frosted Glass Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#090A1A]/75 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <VitrinaLogo size="md" theme="color" />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#arquitectura" className="hover:text-white transition-colors duration-200">
              Arquitectura
            </a>
            <a href="#white-label" className="hover:text-white transition-colors duration-200">
              White-Label
            </a>
            <a href="#seguridad" className="hover:text-white transition-colors duration-200">
              Seguridad RLS
            </a>
            <a href="#experiencia" className="hover:text-white transition-colors duration-200">
              Experiencia PWA
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {context ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-vitrina-blue hover:bg-vitrina-blue/90 text-white shadow-glow transition duration-300"
              >
                Panel de Control →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white font-medium transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-[#18193F] hover:bg-[#E5DEC9] transition duration-300 shadow-md"
                >
                  Abrir Tienda
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section Minimalista (Apple / Samsung Keynote Style) */}
      <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 px-6 max-w-7xl mx-auto w-full text-center flex flex-col items-center">
        {/* Subtle Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-8 hover:border-vitrina-blue/40 transition">
          <span className="w-2 h-2 rounded-full bg-vitrina-blue animate-pulse" />
          <span className="text-xs font-mono tracking-wider uppercase text-slate-300">
            Vitrina 2.0 • Motor SaaS White-Label by BrayLabs
          </span>
        </div>

        {/* Monumental Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-white max-w-5xl leading-[1.08] mb-6">
          La vitrina digital que tu marca merece.
        </h1>

        {/* Editorial Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300/80 max-w-2xl font-light leading-relaxed mb-10">
          Diseñada con arquitectura multi-tenant invisible, aislamiento PostgreSQL de grado bancario y
          rendimiento sin fricción. Cada tienda con su propia identidad visual, catálogo y dominio propio.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-vitrina-blue hover:bg-[#4D52DE] text-white font-medium text-sm transition-all duration-300 shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 group"
          >
            <span>Crear mi Vitrina Virtual</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#arquitectura"
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/15 bg-white/[0.02] hover:bg-white/[0.06] text-slate-200 font-medium text-sm transition-all duration-300 backdrop-blur-md"
          >
            Explorar Arquitectura Técnica
          </a>
        </div>

        {/* Minimalist Showcase Mockup (Hardware / Mobile Preview) */}
        <div className="w-full max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-vitrina-blue/40 via-white/10 to-[#E5DEC9]/20 blur-xl opacity-50 group-hover:opacity-75 transition duration-700" />
          
          <div className="relative rounded-[2rem] border border-white/10 bg-[#141638]/70 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden">
            {/* Top Device Bar */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08] text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-[11px] text-slate-400">acme.vitrina.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                  ● PostgreSQL RLS Activo
                </span>
                <span className="font-mono text-[11px] text-slate-400">12ms Latencia</span>
              </div>
            </div>

            {/* Showcase Product Layout (Luxury E-commerce) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
              {/* Product Visual Card */}
              <div className="md:col-span-5 bg-gradient-to-br from-[#18193F] to-[#0B0C1E] rounded-2xl p-8 border border-white/5 flex flex-col justify-between aspect-[4/5] relative overflow-hidden group">
                <div className="flex justify-between items-start z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white backdrop-blur-md">
                    Edición Especial
                  </span>
                  <div className="w-8 h-8 rounded-full bg-vitrina-blue/30 border border-vitrina-blue/40 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-vitrina-blue" />
                  </div>
                </div>

                {/* Stylized Product Silhouette */}
                <div className="my-auto text-center transform group-hover:scale-105 transition duration-500">
                  <div className="w-36 h-36 mx-auto rounded-3xl bg-gradient-to-tr from-vitrina-blue/40 to-[#E5DEC9]/30 border border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md">
                    <VitrinaLogo variant="mark-only" size="lg" theme="light" />
                  </div>
                </div>

                <div className="z-10">
                  <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">SKU: VIT-LUX-01</div>
                  <div className="text-xl font-serif font-bold text-white mt-0.5">Bolso Signature BrayLabs</div>
                </div>
              </div>

              {/* Product Details & Purchase Engine */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-vitrina-blue font-semibold">
                    Colección Otoño 2026
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
                    Vitrina Linen Atelier
                  </h3>
                  <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                    Personalización en tiempo real vía Design Tokens. Conexión de catálogo multi-variante,
                    deducción atómica de inventario y pedidos sincronizados a WhatsApp sin fricción.
                  </p>
                </div>

                {/* Color Variants (Apple style) */}
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5">
                    Variantes de Color
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-[#3F44CD] ring-2 ring-white ring-offset-2 ring-offset-[#141638] transition" />
                    <button className="w-8 h-8 rounded-full bg-[#18193F] border border-white/20 transition hover:scale-105" />
                    <button className="w-8 h-8 rounded-full bg-[#E5DEC9] transition hover:scale-105" />
                    <button className="w-8 h-8 rounded-full bg-[#6D727A] transition hover:scale-105" />
                  </div>
                </div>

                {/* Price & Cart Actions */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 line-through font-mono">$189.00 USD</div>
                    <div className="text-3xl font-serif font-bold text-white">$145.00 USD</div>
                  </div>
                  <Link
                    href="/login"
                    className="px-6 py-3.5 rounded-full bg-white text-[#18193F] font-semibold text-xs uppercase tracking-wider hover:bg-[#E5DEC9] transition duration-300 shadow-lg"
                  >
                    Probar en Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Pilares Arquitectónicos de Alto Nivel */}
      <section id="arquitectura" className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-vitrina-blue font-semibold">
            Ingeniería de Grado SaaS
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-2">
            La arquitectura de los grandes, adaptada a tu negocio.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Multi-Tenancy */}
          <div className="p-8 rounded-3xl bg-[#141638]/40 border border-white/[0.08] backdrop-blur-md flex flex-col justify-between hover:border-vitrina-blue/40 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-vitrina-blue/20 border border-vitrina-blue/40 flex items-center justify-center text-vitrina-blue font-mono font-bold text-lg mb-6">
                01
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">
                Aislamiento PostgreSQL RLS
              </h3>
              <p className="text-slate-300/80 text-sm leading-relaxed">
                Cada comercio vive en un entorno hermético gobernado por Row-Level Security en la base de datos.
                Protección matemática e inviolable contra accesos cruzados (IDOR).
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-xs font-mono text-slate-400">
              SET LOCAL app.current_tenant_id
            </div>
          </div>

          {/* Card 2: White-Label Engine */}
          <div className="p-8 rounded-3xl bg-[#141638]/40 border border-white/[0.08] backdrop-blur-md flex flex-col justify-between hover:border-vitrina-blue/40 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E5DEC9]/20 border border-[#E5DEC9]/40 flex items-center justify-center text-[#E5DEC9] font-mono font-bold text-lg mb-6">
                02
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">
                White-Label & Design Tokens
              </h3>
              <p className="text-slate-300/80 text-sm leading-relaxed">
                Colores, tipografías, logotipos, bordes y estilos inyectados dinámicamente en tiempo de
                ejecución. Cero componentes hardcodeados. Tu marca es la única protagonista.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-xs font-mono text-slate-400">
              Tokens CSS Variables • JSON Config
            </div>
          </div>

          {/* Card 3: Stock Ledger */}
          <div className="p-8 rounded-3xl bg-[#141638]/40 border border-white/[0.08] backdrop-blur-md flex flex-col justify-between hover:border-vitrina-blue/40 transition duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg mb-6">
                03
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">
                Libro Mayor de Inventario
              </h3>
              <p className="text-slate-300/80 text-sm leading-relaxed">
                Inventario auditado con movimientos inmutables (Stock Ledger). Evita discrepancias,
                mermas y condiciones de carrera con transacciones atómicas.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-xs font-mono text-slate-400">
              Ledger Doble Entrada • ACID Transactions
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer BrayLabs */}
      <footer className="border-t border-white/[0.08] bg-[#070815] py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <VitrinaLogo size="md" theme="color" />
            <p className="text-xs text-slate-400 mt-2">
              Plataforma Comercial SaaS White-Label. Diseñada y construida por BrayLabs &copy; 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <Link href="/login" className="hover:text-white transition">
              Acceso a Comercios
            </Link>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">PostgreSQL RLS Activo</span>
            <span className="text-slate-600">•</span>
            <span>Supabase Cloud</span>
            <span className="text-slate-600">•</span>
            <span>Vercel Edge Ready</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
