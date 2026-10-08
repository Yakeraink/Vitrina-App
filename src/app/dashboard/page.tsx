import { requireTenantContext } from '@/lib/tenant/context';
import { TenantService } from '@/modules/tenant/service';
import { logoutAction, switchTenantAction } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { VitrinaLogo } from '@/components/brand/VitrinaLogo';
import Link from 'next/link';

export default async function DashboardPage() {
  let context;
  try {
    context = await requireTenantContext();
  } catch {
    redirect('/login');
  }

  const { user, tenant, membership, memberships } = context;

  // Retrieve members belonging strictly to the current tenant via PostgreSQL RLS
  const tenantMembers = await TenantService.getTenantMembers(tenant.id);

  return (
    <div className="min-h-screen bg-[#090A1A] text-slate-100 flex flex-col selection:bg-vitrina-blue selection:text-white">
      {/* Top Navigation Bar with Vitrina Brand */}
      <header className="sticky top-0 z-40 bg-[#0E1029]/80 border-b border-white/[0.08] backdrop-blur-xl px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            <VitrinaLogo size="sm" theme="color" />
          </Link>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Active Tenant Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-vitrina-blue/20 border border-vitrina-blue/40 flex items-center justify-center font-serif font-bold text-white text-xs">
              {tenant.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-serif font-semibold text-white leading-none text-sm">{tenant.name}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">slug: {tenant.slug}</div>
            </div>
          </div>

          {/* Multi-Tenant Switcher if user has multiple memberships */}
          {memberships.length > 1 && (
            <form action={switchTenantAction} className="ml-2 flex items-center gap-2">
              <select
                name="tenantId"
                defaultValue={tenant.id}
                className="bg-[#090A1A] border border-white/15 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-vitrina-blue"
              >
                {memberships.map((m) => (
                  <option key={m.tenantId} value={m.tenantId}>
                    {m.tenantName} ({m.role})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#18193F] hover:bg-vitrina-blue text-slate-200 hover:text-white text-xs rounded-lg border border-white/10 transition"
              >
                Cambiar
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center space-x-5">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-white">{user.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium transition border border-white/10 hover:border-rose-500/30"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-10">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-vitrina-blue font-semibold">
            Vitrina Cloud Control
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white mt-1">
            Panel de Operaciones Multi-Tenant
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-light">
            Monitoreo en vivo de aislamiento de datos, membresía y contexto comercial de la organización.
          </p>
        </div>

        {/* Security & Context Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tenant Context */}
          <div className="bg-[#141638]/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="text-[10px] font-mono font-semibold text-vitrina-blue uppercase tracking-widest mb-1">
              Organización / Tenant
            </div>
            <div className="text-2xl font-serif font-bold text-white mt-1">{tenant.name}</div>
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-slate-400">ID de Tenant:</span>
                <span className="font-mono text-slate-300 truncate max-w-[150px]">{tenant.id}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-slate-400">Slug Oficial:</span>
                <span className="font-mono text-white font-medium">{tenant.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado de Tienda:</span>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-mono text-[10px]">
                  ● {tenant.status}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: User Context */}
          <div className="bg-[#141638]/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="text-[10px] font-mono font-semibold text-[#DCE7FD] uppercase tracking-widest mb-1">
              Usuario Activo
            </div>
            <div className="text-2xl font-serif font-bold text-white mt-1">{user.name}</div>
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200">{user.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-slate-400">ID de Usuario:</span>
                <span className="font-mono text-slate-300 truncate max-w-[150px]">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cuenta:</span>
                <span className="px-2.5 py-0.5 bg-vitrina-blue/10 border border-vitrina-blue/20 text-vitrina-blue rounded-full font-mono text-[10px]">
                  ● {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Membership & Role */}
          <div className="bg-[#141638]/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="text-[10px] font-mono font-semibold text-[#E5DEC9] uppercase tracking-widest mb-1">
              Privilegios & Seguridad
            </div>
            <div className="text-2xl font-serif font-bold text-white mt-1 capitalize">{membership.role}</div>
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-slate-400">Aislamiento RLS:</span>
                <span className="text-emerald-400 font-mono font-semibold">100% FORZADO</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-slate-400">Motor de Base de Datos:</span>
                <span className="text-slate-300 font-mono">Supabase PostgreSQL 16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Membresía:</span>
                <span className="px-2.5 py-0.5 bg-[#E5DEC9]/10 border border-[#E5DEC9]/20 text-[#E5DEC9] rounded-full font-mono text-[10px]">
                  ● {membership.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Members List Scoped to Tenant */}
        <div className="bg-[#141638]/50 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-serif font-bold text-white">Equipo del Tenant: {tenant.name}</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Consulta protegida con PostgreSQL Row-Level Security (RLS). Los usuarios de otros tenants jamás aparecen en esta tabla.
              </p>
            </div>
            <span className="inline-flex self-start sm:self-auto px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs rounded-full font-mono">
              Miembros Activos: {tenantMembers.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090A1A]/80 text-slate-400 border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Nombre</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Rol Asignado</th>
                  <th className="p-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {tenantMembers.map((member) => (
                  <tr key={member.membershipId} className="hover:bg-white/[0.02] transition">
                    <td className="p-3.5 font-medium text-white">{member.userName}</td>
                    <td className="p-3.5 text-slate-300 font-mono text-[11px]">{member.userEmail}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-white font-mono text-[11px] uppercase">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-emerald-400 font-medium font-mono text-[11px]">
                        ● {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
