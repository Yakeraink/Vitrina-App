import { eq, desc, and } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { products, tenants, type Product } from '@/lib/db/schema';
import { withTenantContext } from '@/lib/db/rls';

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number; // in cents or dollars, we normalize to cents
  compareAtPrice?: number;
  imageUrl: string;
  category: string;
  stock: number;
  isFeatured?: boolean;
}

export class ProductService {
  /**
   * Retrieves all products for a tenant within the authenticated tenant context (RLS).
   */
  static async getTenantProducts(tenantId: string): Promise<Product[]> {
    return await withTenantContext(tenantId, async (tx) => {
      return await tx
        .select()
        .from(products)
        .where(eq(products.tenantId, tenantId))
        .orderBy(desc(products.createdAt));
    });
  }

  /**
   * Public storefront fetch: Retrieves active products by tenant slug.
   * Public query for shoppers visiting the store without needing merchant login.
   */
  static async getStorefrontProductsBySlug(tenantSlug: string): Promise<{
    tenant: { id: string; name: string; slug: string };
    products: Product[];
  } | null> {
    const db = await getDb();

    const [tenant] = await db
      .select({ id: tenants.id, name: tenants.name, slug: tenants.slug })
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug.toLowerCase()), eq(tenants.status, 'ACTIVE')))
      .limit(1);

    if (!tenant) {
      return null;
    }

    const items = await db
      .select()
      .from(products)
      .where(and(eq(products.tenantId, tenant.id), eq(products.status, 'ACTIVE')))
      .orderBy(desc(products.isFeatured), desc(products.createdAt));

    return { tenant, products: items };
  }

  /**
   * Creates a new product scoped to the tenant.
   */
  static async createProduct(tenantId: string, input: CreateProductInput): Promise<Product> {
    const slug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return await withTenantContext(tenantId, async (tx) => {
      const [newProduct] = await tx
        .insert(products)
        .values({
          tenantId,
          name: input.name,
          slug: `${slug}-${Date.now().toString(36)}`,
          description: input.description,
          price: Math.round(input.price),
          compareAtPrice: input.compareAtPrice ? Math.round(input.compareAtPrice) : null,
          imageUrl: input.imageUrl,
          category: input.category || 'General',
          stock: Number(input.stock) || 0,
          isFeatured: Boolean(input.isFeatured),
          status: 'ACTIVE',
        })
        .returning();

      return newProduct;
    });
  }

  /**
   * Deletes a product within tenant RLS isolation.
   */
  static async deleteProduct(tenantId: string, productId: string): Promise<boolean> {
    return await withTenantContext(tenantId, async (tx) => {
      const deleted = await tx
        .delete(products)
        .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
        .returning({ id: products.id });

      return deleted.length > 0;
    });
  }
}
