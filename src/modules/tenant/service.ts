import { eq, and } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { tenants, tenantMemberships, users, type Role } from '@/lib/db/schema';
import { withTenantContext } from '@/lib/db/rls';
import { createTenantSchema, type CreateTenantInput } from '@/lib/validation/schemas';

export class TenantService {
  /**
   * Creates a new tenant and assigns the creator as the 'owner'.
   */
  static async createTenant(userId: string, input: CreateTenantInput) {
    const validated = createTenantSchema.parse(input);
    const db = await getDb();

    // Check slug collision
    const [existing] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, validated.slug.toLowerCase()))
      .limit(1);

    if (existing) {
      throw new Error(`Tenant slug "${validated.slug}" is already taken`);
    }

    return await db.transaction(async (tx) => {
      const [newTenant] = await tx
        .insert(tenants)
        .values({
          name: validated.name,
          slug: validated.slug.toLowerCase(),
          status: 'ACTIVE',
        })
        .returning();

      const [membership] = await tx
        .insert(tenantMemberships)
        .values({
          tenantId: newTenant.id,
          userId,
          role: 'owner',
          status: 'ACTIVE',
        })
        .returning();

      return { tenant: newTenant, membership };
    });
  }

  /**
   * Retrieves members belonging strictly to the specified tenant.
   * Executed within withTenantContext, enforcing PostgreSQL Row-Level Security (RLS).
   */
  static async getTenantMembers(tenantId: string) {
    return await withTenantContext(tenantId, async (tx) => {
      return await tx
        .select({
          membershipId: tenantMemberships.id,
          role: tenantMemberships.role,
          status: tenantMemberships.status,
          createdAt: tenantMemberships.createdAt,
          userId: users.id,
          userName: users.name,
          userEmail: users.email,
        })
        .from(tenantMemberships)
        .innerJoin(users, eq(tenantMemberships.userId, users.id))
        .where(eq(tenantMemberships.tenantId, tenantId));
    });
  }

  /**
   * Adds or updates a membership role inside a tenant.
   * Requires that the caller has owner or admin privileges in that tenant.
   */
  static async setMemberRole(tenantId: string, targetUserId: string, newRole: Role) {
    return await withTenantContext(tenantId, async (tx) => {
      const [updated] = await tx
        .update(tenantMemberships)
        .set({ role: newRole, updatedAt: new Date() })
        .where(
          and(eq(tenantMemberships.tenantId, tenantId), eq(tenantMemberships.userId, targetUserId))
        )
        .returning();

      if (!updated) {
        throw new Error('Membership not found in this tenant');
      }

      return updated;
    });
  }
}
