import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const switchTenantSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID format'),
});

export type SwitchTenantInput = z.infer<typeof switchTenantSchema>;

export const createTenantSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const membershipRoleSchema = z.enum(['owner', 'admin', 'manager', 'staff']);
export type MembershipRole = z.infer<typeof membershipRoleSchema>;
