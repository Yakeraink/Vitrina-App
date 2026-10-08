import { pgTable, uuid, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const productStatusEnum = ['ACTIVE', 'DRAFT', 'ARCHIVED'] as const;
export type ProductStatus = (typeof productStatusEnum)[number];

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Store in cents: e.g. 14500 = $145.00
  compareAtPrice: integer('compare_at_price'), // Original price for sales/discounts
  imageUrl: text('image_url').notNull(),
  category: text('category').notNull().default('General'),
  stock: integer('stock').notNull().default(10),
  isFeatured: boolean('is_featured').notNull().default(false),
  status: text('status', { enum: productStatusEnum }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
