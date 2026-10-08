import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const orderStatusEnum = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'] as const;
export type OrderStatus = (typeof orderStatusEnum)[number];

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  orderNumber: text('order_number').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  items: jsonb('items').$type<OrderItem[]>().notNull(),
  totalAmount: integer('total_amount').notNull(), // in cents
  status: text('status', { enum: orderStatusEnum }).notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
