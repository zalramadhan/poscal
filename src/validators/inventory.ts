import { z } from 'zod'

export const stockInSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be >= 1'),
  notes: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
})

const reasonCodeSchema = z.enum(['WASTAGE', 'BREAKAGE', 'THEFT', 'SHRINKAGE'])
const reasonCodeWithAdjustmentSchema = z.enum(['WASTAGE', 'BREAKAGE', 'THEFT', 'SHRINKAGE', 'ADJUSTMENT'])

export const stockOutSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be >= 1'),
  notes: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  reason: reasonCodeSchema.optional(),
  note: z.string().optional(),
})

export const adjustmentSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  productId: z.string().min(1, 'Product is required'),
  newQuantity: z.number().min(0, 'Quantity must be >= 0'),
  notes: z.string().optional(),
  reason: reasonCodeWithAdjustmentSchema.optional(),
  note: z.string().optional(),
})

export const opnameSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    systemQuantity: z.number(),
    actualQuantity: z.number().min(0),
  })).min(1, 'At least one item is required'),
})

export const inventoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  lowStock: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type StockInInput = z.infer<typeof stockInSchema>
export type StockOutInput = z.infer<typeof stockOutSchema>
export type AdjustmentInput = z.infer<typeof adjustmentSchema>
export type OpnameInput = z.infer<typeof opnameSchema>
export type InventoryQuery = z.infer<typeof inventoryQuerySchema>
