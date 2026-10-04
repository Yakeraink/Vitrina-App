import { requireTenantContext } from '@/lib/tenant/context';
import { TenantService } from '@/modules/tenant/service';
import { logoutAction, switchTenantAction } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  let context;
  try {
    context = await requireTenantContext();
  } catch {
    redirect('/login');
  }

  const { user, tenant, membership, memberships } = context;

  // Retrieve members belonging to the current tenant strictly via RLS
  const tenantMembers = await TenantService.getTenantMembers(tenant.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-bold text-emerald-400 text-sm">
            {tenant.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white leading-none">{tenant.name}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">slug: {tenant.slug}</div>
          </div>

          {/* Tenant Switcher if multiple memberships */}
          {memberships.length > 1 && (
            <form action={switchTenantAction} className="ml-4 flex items-center gap-2">
              <select
                name="tenantId"
                defaultValue={tenant.id}
                className="bg-slate-950 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200"
              >
                {memberships.map((m) => (
                  <option key={m.tenantId} value={m.tenantId}>
                    {m.tenantName} ({m.role})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
              >
                Cambiar
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-slate-200">{user.name}</div>
            <div className="text-xs text-slate-400">{user.email}</div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs font-medium transition border border-slate-700"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Panel de Control Técnico
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Verificación de contexto multi-tenant, membresía y aislamiento de datos.
          </p>
        </div>

        {/* Security & Context Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tenant Context */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">
              Organización / Tenant
            </div>
            <div className="text-xl font-bold text-white mt-1">{tenant.name}</div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">ID de Tenant:</span>
                <span className="font-mono text-slate-300 truncate max-w-[140px]">{tenant.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Slug:</span>
                <span className="font-mono text-emerald-400">{tenant.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado:</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
                  {tenant.status}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: User Context */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">
              Usuario Autenticado
            </div>
            <div className="text-xl font-bold text-white mt-1">{user.name}</div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300">{user.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">ID de Usuario:</span>
                <span className="font-mono text-slate-300 truncate max-w-[140px]">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado:</span>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full font-medium">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Membership & Role */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">
              Rol & Membresía
            </div>
            <div className="text-xl font-bold text-white mt-1 capitalize">{membership.role}</div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Aislamiento RLS:</span>
                <span className="text-emerald-400 font-semibold">ACTIVO</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Permisos:</span>
                <span className="text-slate-300">Control Total del Tenant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Membresía:</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-medium">
                  {membership.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Members List Scoped to Tenant */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-white">Miembros del Tenant Actual</h3>
              <p className="text-xs text-slate-400">
                Consulta protegida con PostgreSQL Row-Level Security (RLS). Solo se visualizan
                miembros pertenecientes a {tenant.name}.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full font-mono">
              Total: {tenantMembers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tenantMembers.map((member) => (
                  <tr key={member.membershipId} className="hover:bg-slate-800/30">
                    <td className="p-3 font-medium text-white">{member.userName}</td>
                    <td className="p-3 text-slate-300">{member.userEmail}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 capitalize">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-medium">● {member.status}</span>
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
