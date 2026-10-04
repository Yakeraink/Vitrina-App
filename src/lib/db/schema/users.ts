import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const userStatusEnum = ['ACTIVE', 'INACTIVE', 'BANNED'] as const;
export type UserStatus = (typeof userStatusEnum)[number];

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  status: text('status', { enum: userStatusEnum }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
