'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import { VitrinaLogo } from '@/components/brand/VitrinaLogo';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const fillCredentials = (email: string) => {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (emailInput && passwordInput) {
      emailInput.value = email;
      passwordInput.value = email.includes('user-a') ? 'PasswordA123!' : 'PasswordB123!';
    }
  };

  return (
    <div className="min-h-screen bg-[#090A1A] flex flex-col justify-center items-center p-6 text-slate-100 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#3F44CD]/20 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-[#141638]/70 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 transition transform hover:scale-105">
            <VitrinaLogo size="md" theme="color" />
          </Link>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Acceso a Comercios</h2>
          <p className="text-slate-400 text-xs mt-1 font-light">
            Plataforma multi-tenant con aislamiento PostgreSQL RLS
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-2"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu@vitrina.com"
              className="w-full px-4 py-3 bg-[#0B0C1E]/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-vitrina-blue focus:ring-1 focus:ring-vitrina-blue transition duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#0B0C1E]/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-vitrina-blue focus:ring-1 focus:ring-vitrina-blue transition duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-vitrina-blue hover:bg-[#4D52DE] disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all duration-300 shadow-glow hover:shadow-glow-lg"
          >
            {isPending ? 'Verificando Sesión Segura...' : 'Entrar a mi Vitrina'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.08]">
          <p className="text-[11px] text-slate-400 text-center mb-3 font-mono">
            Cuentas de prueba del entorno (Clic para rellenar):
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillCredentials('user-a@acme.com')}
              className="p-3 bg-[#0B0C1E]/60 hover:bg-[#18193F] border border-white/10 rounded-xl text-left transition duration-200 group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-vitrina-blue transition">
                Tenant A (Acme)
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">user-a@acme.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('user-b@beta.com')}
              className="p-3 bg-[#0B0C1E]/60 hover:bg-[#18193F] border border-white/10 rounded-xl text-left transition duration-200 group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-vitrina-blue transition">
                Tenant B (Beta)
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">user-b@beta.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
