// ──────────────────────────────────────────────────────
// POS AI - Core Types
// ──────────────────────────────────────────────────────

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthUser {
  id: string
  tenantId: string
  roleId: string
  branchId?: string | null
  name: string
  email: string
  status: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
  branch?: { id: string; name: string } | null
  tenant: { id: string; name: string; slug: string }
}

// Master Data
export interface Product {
  id: string
  tenantId: string
  categoryId?: string | null
  brandId?: string | null
  unitId?: string | null
  sku: string
  barcode?: string | null
  name: string
  description?: string | null
  costPrice: number
  sellingPrice: number
  image?: string | null
  isActive: boolean
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  unit?: { id: string; name: string; symbol: string } | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  tenantId: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  tenantId: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface Unit {
  id: string
  tenantId: string
  name: string
  symbol: string
  createdAt: string
  updatedAt: string
}

// CRM
export interface Customer {
  id: string
  tenantId: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  points: number
  tier: string
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  tenantId: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

// Inventory
export interface InventoryBalance {
  id: string
  tenantId: string
  warehouseId: string
  productId: string
  quantity: number
  product: { id: string; name: string; sku: string }
  warehouse: { id: string; name: string }
}

export interface InventoryMovement {
  id: string
  tenantId: string
  warehouseId: string
  productId: string
  movementType: string
  quantity: number
  previousStock: number
  currentStock: number
  referenceType?: string | null
  referenceId?: string | null
  notes?: string | null
  createdBy: string
  product: { id: string; name: string; sku: string }
  warehouse: { id: string; name: string }
  createdAt: string
}

// Sales
export interface Sale {
  id: string
  tenantId: string
  branchId: string
  customerId?: string | null
  invoiceNumber: string
  subtotal: number
  discount: number
  tax: number
  total: number
  notes?: string | null
  status: string
  createdBy: string
  customer?: { id: string; name: string } | null
  branch: { id: string; name: string }
  items: SaleItem[]
  payments: Payment[]
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  quantity: number
  price: number
  discount: number
  subtotal: number
  product: { id: string; name: string; sku: string }
}

export interface Payment {
  id: string
  saleId: string
  paymentMethodId: string
  amount: number
  referenceNumber?: string | null
  paymentMethod: { id: string; name: string }
}

// Purchasing
export interface PurchaseOrder {
  id: string
  tenantId: string
  supplierId: string
  warehouseId: string
  poNumber: string
  status: string
  subtotal: number
  total: number
  notes?: string | null
  createdBy: string
  supplier: { id: string; name: string }
  warehouse: { id: string; name: string }
  items: PurchaseOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  productId: string
  quantity: number
  costPrice: number
  subtotal: number
  product: { id: string; name: string; sku: string }
}

// Warehouse
export interface Warehouse {
  id: string
  tenantId: string
  branchId: string
  name: string
  code: string
  address?: string | null
  isActive: boolean
  branch: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export interface StockTransfer {
  id: string
  tenantId: string
  fromWarehouseId: string
  toWarehouseId: string
  transferNumber: string
  status: string
  notes?: string | null
  createdBy: string
  fromWarehouse: { id: string; name: string }
  toWarehouse: { id: string; name: string }
  items: StockTransferItem[]
  createdAt: string
}

export interface StockTransferItem {
  id: string
  stockTransferId: string
  productId: string
  quantity: number
  product: { id: string; name: string; sku: string }
}

// Finance
export interface Income {
  id: string
  tenantId: string
  branchId: string
  amount: number
  category?: string | null
  description?: string | null
  date: string
  branch: { id: string; name: string }
}

export interface Expense {
  id: string
  tenantId: string
  branchId: string
  amount: number
  category?: string | null
  description?: string | null
  date: string
  branch: { id: string; name: string }
}

// Employees & Settings
export interface Employee {
  id: string
  tenantId: string
  roleId: string
  branchId?: string | null
  name: string
  email: string
  status: string
  role: { id: string; name: string }
  branch?: { id: string; name: string } | null
  createdAt: string
}

export interface Role {
  id: string
  tenantId: string
  name: string
  description?: string | null
  permissions: string[]
}

export interface Branch {
  id: string
  tenantId: string
  name: string
  code: string
  address?: string | null
  phone?: string | null
  isActive: boolean
}

// Dashboard
export interface DashboardSummary {
  revenueToday: number
  salesToday: number
  totalProducts: number
  lowStockCount: number
  totalCustomers: number
  recentSales: Sale[]
  topProducts: { id: string; name: string; totalSold: number }[]
}
