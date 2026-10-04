import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { users } from './users';

export const roleEnum = ['owner', 'admin', 'manager', 'staff'] as const;
export type Role = (typeof roleEnum)[number];

export const membershipStatusEnum = ['ACTIVE', 'INVITED', 'SUSPENDED'] as const;
export type MembershipStatus = (typeof membershipStatusEnum)[number];

export const tenantMemberships = pgTable(
  'tenant_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: roleEnum }).notNull().default('staff'),
    status: text('status', { enum: membershipStatusEnum }).notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('tenant_user_unique_idx').on(table.tenantId, table.userId)]
);

export type TenantMembership = typeof tenantMemberships.$inferSelect;
export type NewTenantMembership = typeof tenantMemberships.$inferInsert;
