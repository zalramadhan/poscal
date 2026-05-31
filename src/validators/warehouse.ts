import { z } from 'zod'

export const warehouseSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const warehouseUpdateSchema = warehouseSchema.partial()

export const stockTransferSchema = z.object({
  fromWarehouseId: z.string().min(1, 'Source warehouse is required'),
  toWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1, 'Quantity must be >= 1'),
  })).min(1, 'At least one item is required'),
})

export const stockTransferUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED']),
  notes: z.string().optional(),
})

export type WarehouseInput = z.infer<typeof warehouseSchema>
export type StockTransferInput = z.infer<typeof stockTransferSchema>
