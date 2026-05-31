import { z } from 'zod'

export const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be >= 1'),
  price: z.number().min(0, 'Price must be >= 0'),
  discount: z.number().min(0).default(0),
})

export const paymentSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  amount: z.number().min(0, 'Amount must be >= 0'),
  referenceNumber: z.string().optional(),
})

export const saleSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  customerId: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  payments: z.array(paymentSchema).min(1, 'At least one payment is required'),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
})

export const saleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type SaleInput = z.infer<typeof saleSchema>
export type SaleQuery = z.infer<typeof saleQuerySchema>
