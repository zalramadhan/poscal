import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const customerUpdateSchema = customerSchema.partial()

export type CustomerInput = z.infer<typeof customerSchema>
