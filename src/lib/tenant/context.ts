import { cookies } from 'next/headers';
import { AuthService, type AuthenticatedContext } from '@/modules/auth/service';
import { type Role } from '@/lib/db/schema';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

export { SESSION_COOKIE_NAME };

/**
 * Retrieves the current authenticated context from the secure server-side session cookie.
 */
export async function getSessionContext(): Promise<AuthenticatedContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await AuthService.validateSession(token);
}

/**
 * Enforces authentication and an active tenant context.
 * Throws or redirects if unauthenticated or tenant is unassigned.
 */
export async function requireAuth(): Promise<AuthenticatedContext> {
  const context = await getSessionContext();

  if (!context) {
    throw new Error('UNAUTHENTICATED: Valid session required');
  }

  return context;
}

/**
 * Enforces that the authenticated user belongs to an active tenant.
 */
export async function requireTenantContext(): Promise<{
  user: AuthenticatedContext['user'];
  tenant: NonNullable<AuthenticatedContext['tenant']>;
  membership: NonNullable<AuthenticatedContext['membership']>;
  memberships: AuthenticatedContext['memberships'];
}> {
  const context = await requireAuth();

  if (!context.tenant || !context.membership) {
    throw new Error('NO_TENANT_CONTEXT: User has no active tenant assigned');
  }

  return {
    user: context.user,
    tenant: context.tenant,
    membership: context.membership,
    memberships: context.memberships,
  };
}

/**
 * Role-Based Access Control (RBAC) authorization guard.
 * Verifies that the user's role in the current tenant is in the allowed list.
 */
export async function requireRole(allowedRoles: Role[]) {
  const context = await requireTenantContext();

  if (!allowedRoles.includes(context.membership.role)) {
    throw new Error(
      `FORBIDDEN: Insufficient permissions. Required one of: [${allowedRoles.join(
        ', '
      )}], current role: ${context.membership.role}`
    );
  }

  return context;
}
