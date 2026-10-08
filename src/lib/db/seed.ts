import { eq } from 'drizzle-orm';
import { getDb } from './client';
import { runMigrations } from './migrate';
import { tenants, users, tenantMemberships, products } from './schema';
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

  // 5. Seed initial products for Tenant A (Acme Store)
  const existingProductsA = await db.select().from(products).where(eq(products.tenantId, tenantA.id)).limit(1);
  if (existingProductsA.length === 0) {
    await db.insert(products).values([
      {
        tenantId: tenantA.id,
        name: 'Bolso Signature BrayLabs',
        slug: 'bolso-signature-braylabs',
        description: 'Confeccionado en lino premium y piel genuina. Acabados cobalto metálico con forro aterciopelado.',
        price: 14500, // $145.00
        compareAtPrice: 18900, // $189.00
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        category: 'Bolsos',
        stock: 14,
        isFeatured: true,
        status: 'ACTIVE',
      },
      {
        tenantId: tenantA.id,
        name: 'Reloj Minimalist Chrono Cobalt',
        slug: 'reloj-minimalist-chrono-cobalt',
        description: 'Cristal de zafiro irrayable, movimiento suizo de precisión y caja de acero pulido 316L.',
        price: 28000, // $280.00
        compareAtPrice: 32000,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        category: 'Relojes',
        stock: 8,
        isFeatured: true,
        status: 'ACTIVE',
      },
      {
        tenantId: tenantA.id,
        name: 'Sneakers Obsidian Leather',
        slug: 'sneakers-obsidian-leather',
        description: 'Calzado ergonómico de piel monocromática con suela de amortiguación cloud comfort.',
        price: 19500, // $195.00
        compareAtPrice: 22000,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
        category: 'Calzado',
        stock: 22,
        isFeatured: true,
        status: 'ACTIVE',
      },
      {
        tenantId: tenantA.id,
        name: 'Gafas de Sol Titanium Edition',
        slug: 'gafas-sol-titanium-edition',
        description: 'Montura de titanio aeroespacial con cristales polarizados de protección UV400 completa.',
        price: 11000, // $110.00
        compareAtPrice: 14000,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
        category: 'Accesorios',
        stock: 15,
        isFeatured: false,
        status: 'ACTIVE',
      },
    ]);
    console.log('[Seed] Seeded 4 luxury catalog products for Tenant A');
  }

  // 6. Seed initial products for Tenant B (Beta Shop)
  const existingProductsB = await db.select().from(products).where(eq(products.tenantId, tenantB.id)).limit(1);
  if (existingProductsB.length === 0) {
    await db.insert(products).values([
      {
        tenantId: tenantB.id,
        name: 'Camisa Silk Minimalist Pure',
        slug: 'camisa-silk-minimalist-pure',
        description: 'Seda natural 100% transpirable con corte moderno regular y botones de nácar.',
        price: 12000, // $120.00
        compareAtPrice: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
        category: 'Ropa',
        stock: 18,
        isFeatured: true,
        status: 'ACTIVE',
      },
      {
        tenantId: tenantB.id,
        name: 'Cartera Minimalist Cardholder',
        slug: 'cartera-minimalist-cardholder',
        description: 'Billetera ultrafina con bloqueo RFID y compartimento de expulsión rápida para 6 tarjetas.',
        price: 6500, // $65.00
        compareAtPrice: 8500,
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
        category: 'Accesorios',
        stock: 30,
        isFeatured: true,
        status: 'ACTIVE',
      },
    ]);
    console.log('[Seed] Seeded 2 products for Tenant B');
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
