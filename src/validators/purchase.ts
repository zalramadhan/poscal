import { z } from 'zod'

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be >= 1'),
  costPrice: z.number().min(0, 'Cost price must be >= 0'),
})

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
})

export const purchaseOrderUpdateSchema = purchaseOrderSchema.partial()

export const purchaseOrderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  supplierId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const receiveGoodsSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantityReceived: z.number().min(1, 'Quantity must be >= 1'),
  })).min(1, 'At least one item is required'),
})

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>
export type ReceiveGoodsInput = z.infer<typeof receiveGoodsSchema>
