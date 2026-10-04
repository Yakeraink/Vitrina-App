import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { runMigrations } from './migrate';
import { tenants, users, tenantMemberships } from './schema';
import { hashPassword } from '../security/password';

export async function runSeed() {
  console.log('[Seed] Starting multi-tenant seed script...');
  await runMigrations();

  const db = await getDb();

  // 1. Create or retrieve Tenant A
  let [tenantA] = await db.select().from(tenants).where(eq(tenants.slug, 'acme')).limit(1);

  if (!tenantA) {
    [tenantA] = await db
      .insert(tenants)
      .values({
        name: 'Acme Store',
        slug: 'acme',
        status: 'ACTIVE',
      })
      .returning();
    console.log('[Seed] Created Tenant A (Acme):', tenantA.id);
  }

  // 2. Create or retrieve User A
  let [userA] = await db.select().from(users).where(eq(users.email, 'user-a@acme.com')).limit(1);

  if (!userA) {
    const passwordHashA = await hashPassword('PasswordA123!');
    [userA] = await db
      .insert(users)
      .values({
        email: 'user-a@acme.com',
        name: 'Alice Acme (Owner A)',
        passwordHash: passwordHashA,
        status: 'ACTIVE',
      })
      .returning();
    console.log('[Seed] Created User A:', userA.id);
  }

  // Assign User A to Tenant A
  const [membershipA] = await db
    .select()
    .from(tenantMemberships)
    .where(eq(tenantMemberships.userId, userA.id))
    .limit(1);

  if (!membershipA) {
    await db.insert(tenantMemberships).values({
      tenantId: tenantA.id,
      userId: userA.id,
      role: 'owner',
      status: 'ACTIVE',
    });
    console.log('[Seed] Assigned User A to Tenant A as owner');
  }

  // 3. Create or retrieve Tenant B
  let [tenantB] = await db.select().from(tenants).where(eq(tenants.slug, 'beta')).limit(1);

  if (!tenantB) {
    [tenantB] = await db
      .insert(tenants)
      .values({
        name: 'Beta Shop',
        slug: 'beta',
        status: 'ACTIVE',
      })
      .returning();
    console.log('[Seed] Created Tenant B (Beta):', tenantB.id);
  }

  // 4. Create or retrieve User B
  let [userB] = await db.select().from(users).where(eq(users.email, 'user-b@beta.com')).limit(1);

  if (!userB) {
    const passwordHashB = await hashPassword('PasswordB123!');
    [userB] = await db
      .insert(users)
      .values({
        email: 'user-b@beta.com',
        name: 'Bob Beta (Owner B)',
        passwordHash: passwordHashB,
        status: 'ACTIVE',
      })
      .returning();
    console.log('[Seed] Created User B:', userB.id);
  }

  // Assign User B to Tenant B
  const [membershipB] = await db
    .select()
    .from(tenantMemberships)
    .where(eq(tenantMemberships.userId, userB.id))
    .limit(1);

  if (!membershipB) {
    await db.insert(tenantMemberships).values({
      tenantId: tenantB.id,
      userId: userB.id,
      role: 'owner',
      status: 'ACTIVE',
    });
    console.log('[Seed] Assigned User B to Tenant B as owner');
  }

  console.log('[Seed] Multi-tenant seed completed successfully.');
  return { tenantA, userA, tenantB, userB };
}

if (process.argv[1]?.includes('seed.ts')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
