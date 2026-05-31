import { z } from 'zod'

export const productSchema = z.object({
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unitId: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  costPrice: z.number().min(0, 'Cost price must be >= 0'),
  sellingPrice: z.number().min(0, 'Selling price must be >= 0'),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  minStock: z.number().min(0).optional(),
})

export const productUpdateSchema = productSchema.partial()

export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  isActive: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductQuery = z.infer<typeof productQuerySchema>
