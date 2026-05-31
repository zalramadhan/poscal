import { z } from 'zod'

export const roleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

export const roleUpdateSchema = roleSchema.partial()

export const branchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const branchUpdateSchema = branchSchema.partial()

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  roleId: z.string().optional(),
  branchId: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

export const tenantSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  currency: z.string().optional(),
  timezone: z.string().optional(),
})

export type RoleInput = z.infer<typeof roleSchema>
export type BranchInput = z.infer<typeof branchSchema>
export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>
