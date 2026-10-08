import { requireTenantContext } from '@/lib/tenant/context';
import { TenantService } from '@/modules/tenant/service';
import { ProductService } from '@/modules/product/service';
import { logoutAction, switchTenantAction } from '@/app/actions/auth';
import { deleteProductAction } from '@/app/actions/product';
import { redirect } from 'next/navigation';
import { VitrinaLogo } from '@/components/brand/VitrinaLogo';
import { NewProductModal } from '@/components/dashboard/NewProductModal';
import Link from 'next/link';

export default async function DashboardPage() {
  let context;
  try {
    context = await requireTenantContext();
  } catch {
    redirect('/login');
  }

  const { user, tenant, membership, memberships } = context;

  // Retrieve products belonging strictly to the current tenant via PostgreSQL RLS
  let tenantProducts: Awaited<ReturnType<typeof ProductService.getTenantProducts>> = [];
  try {
    tenantProducts = await ProductService.getTenantProducts(tenant.id);
  } catch (error) {
    console.error('[Dashboard Products Error]:', error);
  }

  // Retrieve members belonging strictly to the current tenant via PostgreSQL RLS
  let tenantMembers: Awaited<ReturnType<typeof TenantService.getTenantMembers>> = [];
  try {
    tenantMembers = await TenantService.getTenantMembers(tenant.id);
  } catch (error) {
    console.error('[Dashboard TenantMembers Error]:', error);
  }

  // Calculate quick metrics
  const totalStockUnits = tenantProducts.reduce((acc, p) => acc + p.stock, 0);
  const totalCatalogValue = tenantProducts.reduce((acc, p) => acc + (p.price * p.stock) / 100, 0);

  return (
    <div className="min-h-screen bg-[#070815] text-slate-100 flex flex-col selection:bg-[#3F44CD] selection:text-white">
      {/* Top Navigation Bar with Vitrina Brand */}
      <header className="sticky top-0 z-40 bg-[#0E1029]/90 border-b border-white/[0.08] backdrop-blur-2xl px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            <VitrinaLogo size="sm" theme="color" />
          </Link>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Active Tenant Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#3F44CD]/20 border border-[#3F44CD]/40 flex items-center justify-center font-serif font-bold text-white text-sm shadow-glow">
              {tenant.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-serif font-semibold text-white leading-none text-sm">{tenant.name}</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tienda Activa • slug: {tenant.slug}
              </div>
            </div>
          </div>

          {/* Multi-Tenant Switcher if user has multiple memberships */}
          {memberships.length > 1 && (
            <form action={switchTenantAction} className="ml-2 flex items-center gap-2">
              <select
                name="tenantId"
                defaultValue={tenant.id}
                className="bg-[#090A1A] border border-white/15 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-[#3F44CD]"
              >
                {memberships.map((m) => (
                  <option key={m.tenantId} value={m.tenantId}>
                    {m.tenantName} ({m.role})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#18193F] hover:bg-[#3F44CD] text-slate-200 hover:text-white text-xs rounded-lg border border-white/10 transition"
              >
                Cambiar
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Quick Direct Link to Storefront */}
          <Link
            href={`/store/${tenant.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-white text-[#18193F] hover:bg-[#E5DEC9] text-xs font-semibold uppercase tracking-wider transition shadow flex items-center gap-1.5"
          >
            <span>Ver mi Tienda en Vivo</span>
            <span className="text-xs">↗</span>
          </Link>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-white">{user.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium transition border border-white/10 hover:border-rose-500/30"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Banner: Tu Tienda en Vivo */}
        <div className="bg-gradient-to-r from-[#18193F] via-[#141638] to-[#0A0B1A] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3F44CD]/10 blur-[100px] pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Tu Tienda Virtual está en línea
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
                {tenant.name} — Vitrina Comercial
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl font-light">
                Tus clientes pueden explorar tu catálogo minimalista, seleccionar variantes y enviarte pedidos
                directos por WhatsApp en cualquier momento.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Enlace público:</span>
                <span className="text-[#DCE7FD] bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  /store/{tenant.slug}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/store/${tenant.slug}`}
                target="_blank"
                className="px-6 py-3.5 rounded-2xl bg-[#3F44CD] hover:bg-[#4D52DE] text-white text-xs font-semibold uppercase tracking-wider transition shadow-glow flex items-center gap-2"
              >
                <span>Visitar como Cliente ↗</span>
              </Link>
              <NewProductModal />
            </div>
          </div>
        </div>

        {/* Commercial Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#141638]/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="text-[10px] font-mono font-semibold text-[#3F44CD] uppercase tracking-wider">
              Productos en Tienda
            </div>
            <div className="text-3xl font-serif font-bold text-white mt-1">{tenantProducts.length}</div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <span className="text-emerald-400">●</span> {tenantProducts.filter((p) => p.stock > 0).length} con stock disponible
            </div>
          </div>

          <div className="bg-[#141638]/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Unidades en Inventario
            </div>
            <div className="text-3xl font-serif font-bold text-white mt-1">{totalStockUnits}</div>
            <div className="text-[11px] text-slate-400 mt-2">Stock total en bodega</div>
          </div>

          <div className="bg-[#141638]/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="text-[10px] font-mono font-semibold text-[#E5DEC9] uppercase tracking-wider">
              Valor de Catálogo
            </div>
            <div className="text-3xl font-serif font-bold text-white mt-1">
              ${totalCatalogValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">Valuación estimada USD</div>
          </div>

          <div className="bg-[#141638]/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="text-[10px] font-mono font-semibold text-[#DCE7FD] uppercase tracking-wider">
              Canal de Pedidos
            </div>
            <div className="text-2xl font-serif font-bold text-white mt-1">WhatsApp Live</div>
            <div className="text-[11px] text-emerald-400 mt-2">Checkout directo activado</div>
          </div>
        </div>

        {/* Catalog Manager (Products Grid) */}
        <div className="bg-[#141638]/40 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-2xl font-serif font-bold text-white">Catálogo de Productos</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Los productos que publiques aquí aparecen en tiempo real en la vitrina de tus clientes.
              </p>
            </div>
            <NewProductModal />
          </div>

          {tenantProducts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/15 rounded-2xl p-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 flex items-center justify-center text-3xl">
                ✨
              </div>
              <h4 className="font-serif font-bold text-lg text-white">Aún no tienes productos en tu catálogo</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Crea tu primer producto para que tu tienda virtual esté lista para recibir compras.
              </p>
              <NewProductModal />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tenantProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#0E1029] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between hover:border-[#3F44CD]/40 transition group relative"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 mb-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                      />
                      {prod.isFeatured && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#3F44CD] text-white text-[10px] font-mono uppercase tracking-wider font-bold">
                          Insignia
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-[10px] font-mono">
                        {prod.stock} en stock
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {prod.category}
                    </div>
                    <h4 className="font-serif font-bold text-base text-white mt-0.5 line-clamp-1">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      {prod.compareAtPrice && (
                        <div className="text-[10px] text-slate-500 line-through font-mono">
                          ${(prod.compareAtPrice / 100).toFixed(2)}
                        </div>
                      )}
                      <div className="font-serif font-bold text-lg text-white">
                        ${(prod.price / 100).toFixed(2)}{' '}
                        <span className="text-[10px] font-sans text-slate-400">USD</span>
                      </div>
                    </div>

                    <form action={deleteProductAction}>
                      <input type="hidden" name="productId" value={prod.id} />
                      <button
                        type="submit"
                        title="Eliminar producto"
                        className="px-2.5 py-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs transition"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technical & Security Details (Secondary / Collapsible section) */}
        <details className="bg-[#141638]/20 border border-white/[0.06] rounded-2xl p-5 text-xs text-slate-400">
          <summary className="font-mono text-slate-300 cursor-pointer select-none flex items-center justify-between">
            <span>⚙️ Parámetros de Infraestructura, Equipo & Seguridad RLS (Avanzado)</span>
            <span className="text-slate-500 text-[10px]">Click para expandir</span>
          </summary>
          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-500 block">ID del Tenant (UUID):</span>
              <span className="font-mono text-slate-300">{tenant.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Aislamiento de Base de Datos:</span>
              <span className="font-mono text-emerald-400">PostgreSQL 16 RLS Activo</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tu Rol Administrativo:</span>
              <span className="font-mono text-white capitalize">{membership.role}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="font-mono text-slate-300 mb-2">Miembros con Acceso a este Tenant:</div>
            <div className="flex flex-wrap gap-2">
              {tenantMembers.map((m) => (
                <span
                  key={m.membershipId}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]"
                >
                  {m.userName} ({m.userEmail}) • <span className="text-emerald-400 uppercase">{m.role}</span>
                </span>
              ))}
            </div>
          </div>
        </details>
      </main>
    </div>
  );
}
