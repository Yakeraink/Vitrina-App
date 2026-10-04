import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const tenantStatusEnum = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] as const;
export type TenantStatus = (typeof tenantStatusEnum)[number];

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: text('status', { enum: tenantStatusEnum }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
