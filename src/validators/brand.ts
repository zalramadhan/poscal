import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

export const brandUpdateSchema = brandSchema.partial()

export type BrandInput = z.infer<typeof brandSchema>
