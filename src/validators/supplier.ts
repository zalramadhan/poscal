import { z } from 'zod'

export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const supplierUpdateSchema = supplierSchema.partial()

export type SupplierInput = z.infer<typeof supplierSchema>
