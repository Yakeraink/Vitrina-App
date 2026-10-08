import { sql } from 'drizzle-orm';
import { getDb } from './client';

let cachedSupportsAuthenticated: boolean | null = null;

async function checkAuthenticatedRole(db: Awaited<ReturnType<typeof getDb>>): Promise<boolean> {
  if (cachedSupportsAuthenticated !== null) {
    return cachedSupportsAuthenticated;
  }
  try {
    const res = await db.execute(sql`
      SELECT 1 FROM pg_roles WHERE rolname = 'authenticated' LIMIT 1;
    `);
    const rows = Array.isArray(res) ? res : (res as unknown as { rows?: unknown[] })?.rows ?? [];
    cachedSupportsAuthenticated = rows.length > 0;
  } catch {
    cachedSupportsAuthenticated = false;
  }
  return cachedSupportsAuthenticated;
}

/**
 * Applies PostgreSQL Row-Level Security (RLS) to tenant-bound tables.
 * Also configures the unprivileged application role (authenticated) so that
 * RLS is strictly enforced even when connecting initially as postgres.
 */
export async function setupRLS() {
  const db = await getDb();

  // 1. Create unprivileged authenticated role if it does not exist (standard in Supabase, created in local/PGlite)
  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated WITH LOGIN NOSUPERUSER NOBYPASSRLS;
        END IF;
      END $$;
    `);
    await db.execute(sql`GRANT USAGE ON SCHEMA public TO authenticated;`);
    await db.execute(sql`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;`);
    await db.execute(sql`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;`);
  } catch (error) {
    console.warn('[RLS Role Setup Notice]:', error);
  }

  // 2. Enable and configure RLS policies on tenant-isolated tables
  const rlsStatements = [
    // Table: tenant_memberships
    `ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE tenant_memberships FORCE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS tenant_isolation_memberships ON tenant_memberships;`,
    `CREATE POLICY tenant_isolation_memberships ON tenant_memberships
      FOR ALL
      TO public, authenticated
      USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
      )
      WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
      );`,

    // Table: tenant_audit_logs
    `ALTER TABLE tenant_audit_logs ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE tenant_audit_logs FORCE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS tenant_isolation_audit_logs ON tenant_audit_logs;`,
    `CREATE POLICY tenant_isolation_audit_logs ON tenant_audit_logs
      FOR ALL
      TO public, authenticated
      USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
      )
      WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
      );`,
  ];

  for (const statement of rlsStatements) {
    try {
      await db.execute(sql.raw(statement));
    } catch (error) {
      console.warn(`[RLS Setup Notice]: Could not execute statement: "${statement}".`, error);
    }
  }
}

/**
 * Runs a transactional database operation with a strictly scoped tenant context.
 * Sets SET LOCAL app.current_tenant_id and conditionally SET LOCAL ROLE authenticated,
 * guaranteeing that RLS policies are strictly enforced and automatically cleaned up upon transaction completion.
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (
    tx: Parameters<Parameters<Awaited<ReturnType<typeof getDb>>['transaction']>[0]>[0]
  ) => Promise<T>
): Promise<T> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(tenantId)) {
    throw new Error(`Invalid tenant ID format: ${tenantId}`);
  }

  const db = await getDb();
  const supportsAuthRole = await checkAuthenticatedRole(db);

  return await db.transaction(async (tx) => {
    // Switch to non-superuser application role to ensure RLS cannot be bypassed
    if (supportsAuthRole) {
      await tx.execute(sql.raw(`SET LOCAL ROLE authenticated;`));
    }

    // Set transactional tenant parameter
    await tx.execute(sql.raw(`SET LOCAL app.current_tenant_id = '${tenantId}';`));

    try {
      return await callback(tx);
    } finally {
      // Defense in depth: reset role and tenant parameter prior to connection release
      try {
        await tx.execute(sql.raw(`RESET app.current_tenant_id;`));
        if (supportsAuthRole) {
          await tx.execute(sql.raw(`RESET ROLE;`));
        }
      } catch {
        // Ignored if transaction already committed or aborted
      }
    }
  });
}
