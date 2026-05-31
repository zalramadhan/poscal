import { z } from 'zod'

export const unitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
})

export const unitUpdateSchema = unitSchema.partial()

export type UnitInput = z.infer<typeof unitSchema>
