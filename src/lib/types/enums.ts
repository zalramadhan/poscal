export const InventoryMovementType = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  RETURN: 'RETURN',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_OUT: 'TRANSFER_OUT',
  STOCK_OPNAME: 'STOCK_OPNAME',
  WASTAGE: 'WASTAGE',
  BREAKAGE: 'BREAKAGE',
  THEFT: 'THEFT',
  SHRINKAGE: 'SHRINKAGE',
} as const

export type InventoryMovementType = (typeof InventoryMovementType)[keyof typeof InventoryMovementType]

export const SaleStatus = {
  DRAFT: 'DRAFT',
  HOLD: 'HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus]

export const TransferStatus = {
  DRAFT: 'DRAFT',
  APPROVAL_PENDING: 'APPROVAL_PENDING',
  APPROVED: 'APPROVED',
  IN_TRANSIT: 'IN_TRANSIT',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
} as const

export type TransferStatus = (typeof TransferStatus)[keyof typeof TransferStatus]

export const StockOpnameStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const

export type StockOpnameStatus = (typeof StockOpnameStatus)[keyof typeof StockOpnameStatus]

export const PurchaseOrderStatus = {
  DRAFT: 'DRAFT',
  APPROVED: 'APPROVED',
  ORDERED: 'ORDERED',
  RECEIVED: 'RECEIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus]