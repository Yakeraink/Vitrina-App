'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthService } from '@/modules/auth/service';
import { SESSION_COOKIE_NAME } from '@/lib/tenant/context';
import { loginSchema, switchTenantSchema } from '@/lib/validation/schemas';

export async function loginAction(prevState: { error?: string } | null, formData: FormData) {
  const email = formData.get('email')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Datos de acceso inválidos' };
  }

  try {
    const { rawToken, expiresAt } = await AuthService.login(parsed.data);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
    return { error: message };
  }

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      await AuthService.logout(token);
    } catch {
      // Ignored
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export async function switchTenantAction(formData: FormData): Promise<void> {
  const tenantId = formData.get('tenantId')?.toString() || '';

  const parsed = switchTenantSchema.safeParse({ tenantId });
  if (!parsed.success) {
    redirect('/dashboard');
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    await AuthService.switchTenant(token, parsed.data.tenantId);
  } catch {
    redirect('/dashboard');
  }

  redirect('/dashboard');
}
