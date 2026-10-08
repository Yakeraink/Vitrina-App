import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb, closeDb } from '@/lib/db/client';
import { runMigrations } from '@/lib/db/migrate';
import { runSeed } from '@/lib/db/seed';
import { AuthService } from '@/modules/auth/service';
import { TenantService } from '@/modules/tenant/service';
import { withTenantContext } from '@/lib/db/rls';
import { tenantMemberships } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

describe('FASE 1: Multi-Tenant Core Security & Isolation Suite', () => {
  let seedData: Awaited<ReturnType<typeof runSeed>>;

  beforeAll(async () => {
    // Initialize database, tables, RLS policies and seed data
    await runMigrations();
    seedData = await runSeed();
  }, 30000);

  afterAll(async () => {
    await closeDb();
  });

  it('Caso 1: User A autenticado consulta legítimamente información de Tenant A (SUCCESS)', async () => {
    // 1. User A logs in
    const authResult = await AuthService.login({
      email: 'user-a@acme.com',
      password: 'PasswordA123!',
    });

    expect(authResult.rawToken).toBeDefined();
    expect(authResult.activeTenant?.slug).toBe('acme');
    expect(authResult.activeTenant?.role).toBe('owner');

    // 2. Validate session
    const sessionContext = await AuthService.validateSession(authResult.rawToken);
    expect(sessionContext).not.toBeNull();
    expect(sessionContext?.tenant?.id).toBe(seedData.tenantA.id);

    // 3. Query tenant members using Tenant A context
    const members = await TenantService.getTenantMembers(seedData.tenantA.id);
    expect(members.length).toBeGreaterThanOrEqual(1);
    expect(members.some((m) => m.userEmail === 'user-a@acme.com')).toBe(true);
  });

  it('Caso 2: User A intenta consultar información de Tenant B (DENIED vía RLS & Auth)', async () => {
    // User A attempts to switch active tenant to Tenant B without having membership
    const authResult = await AuthService.login({
      email: 'user-a@acme.com',
      password: 'PasswordA123!',
    });

    // Attempting to switch active tenant to Tenant B must throw Forbidden
    await expect(
      AuthService.switchTenant(authResult.rawToken, seedData.tenantB.id)
    ).rejects.toThrow(/Forbidden/);
  });

  it('Caso 3: Manipulación manual de tenantId en consultas de base de datos protegidas por RLS (DENIED)', async () => {
    // An attacker runs a query attempting to retrieve Tenant B's data
    // while the active transactional context is set to Tenant A.
    const leakedData = await withTenantContext(seedData.tenantA.id, async (tx) => {
      return await tx
        .select()
        .from(tenantMemberships)
        .where(eq(tenantMemberships.tenantId, seedData.tenantB.id));
    });

    // PostgreSQL RLS strictly filters out any rows not matching app.current_tenant_id.
    // Zero rows are returned.
    expect(leakedData).toHaveLength(0);
  });

  it('Caso 4: Solicitud sin autenticación o con token inválido intenta acceder (DENIED)', async () => {
    // An unauthenticated request passes an empty or random token
    const unauthenticatedContext = await AuthService.validateSession('');
    expect(unauthenticatedContext).toBeNull();

    const forgedTokenContext = await AuthService.validateSession(
      'non-existent-or-forged-token-xyz'
    );
    expect(forgedTokenContext).toBeNull();
  });

  it('Caso 5: Usuario de Tenant A intenta ejecutar operación administrativa sobre Tenant B (DENIED)', async () => {
    // Attempting to modify Tenant B's membership while running under Tenant A's context
    await expect(
      TenantService.setMemberRole(seedData.tenantA.id, seedData.userB.id, 'admin')
    ).rejects.toThrow(/Membership not found in this tenant/);
  });

  it('Seguridad adicional: Rechazo de contraseñas incorrectas y protección de hashes', async () => {
    await expect(
      AuthService.login({
        email: 'user-a@acme.com',
        password: 'WrongPassword!',
      })
    ).rejects.toThrow('Invalid email or password');
  });

  it('Aislamiento de Connection Pool: El contexto RLS no contamina transacciones subsiguientes', async () => {
    const db = await getDb();

    // 1. Run operation with Tenant A context
    await withTenantContext(seedData.tenantA.id, async (tx) => {
      const execRes = (await tx.execute(
        sql`SELECT current_setting('app.current_tenant_id', true) as current_tenant;`
      )) as unknown as {
        rows?: Array<{ current_tenant?: string }>;
        [index: number]: { current_tenant?: string };
      };
      const row = execRes.rows ? execRes.rows[0] : execRes[0];
      expect(row?.current_tenant).toBe(seedData.tenantA.id);
    });

    // 2. Run query outside withTenantContext: app.current_tenant_id must be completely empty/null
    const execResOutside = (await db.execute(
      sql`SELECT current_setting('app.current_tenant_id', true) as current_tenant;`
    )) as unknown as {
      rows?: Array<{ current_tenant?: string }>;
      [index: number]: { current_tenant?: string };
    };
    const clearedRow = execResOutside.rows ? execResOutside.rows[0] : execResOutside[0];
    const tenantSetting = clearedRow?.current_tenant;
    expect(tenantSetting === '' || tenantSetting === null || tenantSetting === undefined).toBe(
      true
    );
  });
});
