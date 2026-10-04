'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <span className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-bold text-emerald-400 mx-auto">
              TV
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
          <p className="text-slate-400 text-sm mt-1">Acceso seguro multi-tenant a la plataforma</p>
        </div>

        {state?.error && (
          <div className="mb-6 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="tu@negocio.com"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-emerald-900/40"
          >
            {isPending ? 'Verificando...' : 'Entrar al Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center mb-3">
            Cuentas de prueba del entorno de desarrollo:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('user-a@acme.com')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition"
            >
              <div className="text-xs font-semibold text-emerald-400">Tenant A (Acme)</div>
              <div className="text-[11px] text-slate-500 truncate">user-a@acme.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('user-b@beta.com')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition"
            >
              <div className="text-xs font-semibold text-cyan-400">Tenant B (Beta)</div>
              <div className="text-[11px] text-slate-500 truncate">user-b@beta.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
