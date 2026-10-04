import { eq, and, gt } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { users, sessions, tenantMemberships, tenants } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/security/password';
import { generateSessionToken, hashSessionToken } from '@/lib/security/token';
import { loginSchema, type LoginInput } from '@/lib/validation/schemas';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export interface AuthenticatedContext {
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
  membership: {
    id: string;
    role: 'owner' | 'admin' | 'manager' | 'staff';
    status: string;
  } | null;
  memberships: Array<{
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    role: 'owner' | 'admin' | 'manager' | 'staff';
  }>;
}

export class AuthService {
  /**
   * Authenticates a user by email and password, creates a secure session,
   * and associates the initial active tenant membership.
   */
  static async login(input: LoginInput) {
    const validated = loginSchema.parse(input);
    const db = await getDb();

    // 1. Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email.toLowerCase()))
      .limit(1);

    if (!user || user.status !== 'ACTIVE') {
      throw new Error('Invalid email or password');
    }

    // 2. Verify password hash
    const isValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // 3. Fetch user memberships with tenant details
    const userMemberships = await db
      .select({
        membershipId: tenantMemberships.id,
        role: tenantMemberships.role,
        status: tenantMemberships.status,
        tenantId: tenants.id,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
        tenantStatus: tenants.status,
      })
      .from(tenantMemberships)
      .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
      .where(
        and(
          eq(tenantMemberships.userId, user.id),
          eq(tenantMemberships.status, 'ACTIVE'),
          eq(tenants.status, 'ACTIVE')
        )
      );

    const defaultTenant = userMemberships[0] || null;

    // 4. Generate cryptographically random token
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    // 5. Store session with hashed token
    await db.insert(sessions).values({
      userId: user.id,
      activeTenantId: defaultTenant ? defaultTenant.tenantId : null,
      tokenHash,
      expiresAt,
    });

    return {
      rawToken,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      activeTenant: defaultTenant
        ? {
            id: defaultTenant.tenantId,
            name: defaultTenant.tenantName,
            slug: defaultTenant.tenantSlug,
            role: defaultTenant.role,
          }
        : null,
    };
  }

  /**
   * Validates a session token, enforces expiration, verifies user status,
   * and loads current tenant membership.
   */
  static async validateSession(rawToken: string): Promise<AuthenticatedContext | null> {
    if (!rawToken || rawToken.trim() === '') {
      return null;
    }

    const tokenHash = hashSessionToken(rawToken);
    const db = await getDb();
    const now = new Date();

    // 1. Find active session
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1);

    if (!session) {
      return null;
    }

    // 2. Load user
    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    // 3. Load all active memberships for the user
    const allMemberships = await db
      .select({
        membershipId: tenantMemberships.id,
        role: tenantMemberships.role,
        membershipStatus: tenantMemberships.status,
        tenantId: tenants.id,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
        tenantStatus: tenants.status,
      })
      .from(tenantMemberships)
      .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
      .where(
        and(
          eq(tenantMemberships.userId, user.id),
          eq(tenantMemberships.status, 'ACTIVE'),
          eq(tenants.status, 'ACTIVE')
        )
      );

    let activeTenant: AuthenticatedContext['tenant'] = null;
    let activeMembership: AuthenticatedContext['membership'] = null;

    if (session.activeTenantId) {
      const match = allMemberships.find((m) => m.tenantId === session.activeTenantId);
      if (match) {
        activeTenant = {
          id: match.tenantId,
          name: match.tenantName,
          slug: match.tenantSlug,
          status: match.tenantStatus,
        };
        activeMembership = {
          id: match.membershipId,
          role: match.role,
          status: match.membershipStatus,
        };
      }
    }

    // If activeTenantId was not set or became invalid, default to first available
    if (!activeTenant && allMemberships.length > 0) {
      const first = allMemberships[0];
      activeTenant = {
        id: first.tenantId,
        name: first.tenantName,
        slug: first.tenantSlug,
        status: first.tenantStatus,
      };
      activeMembership = {
        id: first.membershipId,
        role: first.role,
        status: first.membershipStatus,
      };
      // Persist fallback selection to session
      await db
        .update(sessions)
        .set({ activeTenantId: first.tenantId, lastActiveAt: new Date() })
        .where(eq(sessions.id, session.id));
    } else {
      // Refresh last active timestamp
      await db
        .update(sessions)
        .set({ lastActiveAt: new Date() })
        .where(eq(sessions.id, session.id));
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
      tenant: activeTenant,
      membership: activeMembership,
      memberships: allMemberships.map((m) => ({
        tenantId: m.tenantId,
        tenantName: m.tenantName,
        tenantSlug: m.tenantSlug,
        role: m.role,
      })),
    };
  }

  /**
   * Switches active tenant for the current session.
   * STRICT SECURITY: Checks that the user is actually an active member of the target tenant.
   * Throws an unauthorized error if IDOR is attempted.
   */
  static async switchTenant(rawToken: string, targetTenantId: string) {
    const tokenHash = hashSessionToken(rawToken);
    const db = await getDb();

    // 1. Get session
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!session) {
      throw new Error('Unauthorized: Session not found or expired');
    }

    // 2. Verify target tenant membership strictly
    const [membership] = await db
      .select()
      .from(tenantMemberships)
      .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
      .where(
        and(
          eq(tenantMemberships.userId, session.userId),
          eq(tenantMemberships.tenantId, targetTenantId),
          eq(tenantMemberships.status, 'ACTIVE'),
          eq(tenants.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (!membership) {
      throw new Error('Forbidden: User is not an active member of the target tenant');
    }

    // 3. Update session
    await db
      .update(sessions)
      .set({ activeTenantId: targetTenantId, lastActiveAt: new Date() })
      .where(eq(sessions.id, session.id));

    return { success: true, targetTenantId };
  }

  /**
   * Revokes a session upon logout.
   */
  static async logout(rawToken: string) {
    if (!rawToken) return;
    const tokenHash = hashSessionToken(rawToken);
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }
}
