// ──────────────────────────────────────────────────────
// POS AI - Permission Definitions
// Based on PERMISSION_MATRIX_DETAILED.md
// ──────────────────────────────────────────────────────

export const Roles = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  WAREHOUSE: 'Warehouse Staff',
} as const

export type RoleType = (typeof Roles)[keyof typeof Roles]

export const Permissions = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',

  // Products
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_EDIT: 'product:edit',
  PRODUCT_DELETE: 'product:delete',

  // Categories
  CATEGORY_VIEW: 'category:view',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_EDIT: 'category:edit',
  CATEGORY_DELETE: 'category:delete',

  // Brands
  BRAND_VIEW: 'brand:view',
  BRAND_CREATE: 'brand:create',
  BRAND_EDIT: 'brand:edit',
  BRAND_DELETE: 'brand:delete',

  // Units
  UNIT_VIEW: 'unit:view',
  UNIT_CREATE: 'unit:create',
  UNIT_EDIT: 'unit:edit',
  UNIT_DELETE: 'unit:delete',

  // Customers
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_EDIT: 'customer:edit',
  CUSTOMER_DELETE: 'customer:delete',

  // Suppliers
  SUPPLIER_VIEW: 'supplier:view',
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_EDIT: 'supplier:edit',
  SUPPLIER_DELETE: 'supplier:delete',

  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_STOCK_IN: 'inventory:stock-in',
  INVENTORY_STOCK_OUT: 'inventory:stock-out',
  INVENTORY_ADJUSTMENT: 'inventory:adjustment',
  INVENTORY_OPNAME: 'inventory:opname',

  // POS / Sales
  POS_VIEW: 'pos:view',
  SALE_CREATE: 'sale:create',
  SALE_COMPLETE: 'sale:complete',
  SALE_REFUND: 'sale:refund',
  SALE_CANCEL: 'sale:cancel',

  // Purchases
  PURCHASE_VIEW: 'purchase:view',
  PURCHASE_CREATE: 'purchase:create',
  PURCHASE_EDIT: 'purchase:edit',
  PURCHASE_APPROVE: 'purchase:approve',
  PURCHASE_RECEIVE: 'purchase:receive',
  PURCHASE_CANCEL: 'purchase:cancel',

  // Stock Transfers
  TRANSFER_VIEW: 'transfer:view',
  TRANSFER_CREATE: 'transfer:create',
  TRANSFER_SHIP: 'transfer:ship',
  TRANSFER_RECEIVE: 'transfer:receive',

  // Reports
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',

  // Finance
  FINANCE_VIEW: 'finance:view',
  FINANCE_CREATE: 'finance:create',
  FINANCE_EDIT: 'finance:edit',

  // Employees
  EMPLOYEE_VIEW: 'employee:view',
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_EDIT: 'employee:edit',
  EMPLOYEE_DELETE: 'employee:delete',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const

export type PermissionType = (typeof Permissions)[keyof typeof Permissions]

// Role-to-Permission mapping
export const RolePermissions: Record<string, string[]> = {
  [Roles.OWNER]: Object.values(Permissions),

  [Roles.MANAGER]: [
    Permissions.DASHBOARD_VIEW,
    Permissions.PRODUCT_VIEW,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_EDIT,
    Permissions.PRODUCT_DELETE,
    Permissions.CATEGORY_VIEW,
    Permissions.CATEGORY_CREATE,
    Permissions.CATEGORY_EDIT,
    Permissions.CATEGORY_DELETE,
    Permissions.BRAND_VIEW,
    Permissions.BRAND_CREATE,
    Permissions.BRAND_EDIT,
    Permissions.BRAND_DELETE,
    Permissions.UNIT_VIEW,
    Permissions.UNIT_CREATE,
    Permissions.UNIT_EDIT,
    Permissions.UNIT_DELETE,
    Permissions.CUSTOMER_VIEW,
    Permissions.CUSTOMER_CREATE,
    Permissions.CUSTOMER_EDIT,
    Permissions.CUSTOMER_DELETE,
    Permissions.SUPPLIER_VIEW,
    Permissions.SUPPLIER_CREATE,
    Permissions.SUPPLIER_EDIT,
    Permissions.SUPPLIER_DELETE,
    Permissions.INVENTORY_VIEW,
    Permissions.INVENTORY_STOCK_IN,
    Permissions.INVENTORY_STOCK_OUT,
    Permissions.INVENTORY_ADJUSTMENT,
    Permissions.INVENTORY_OPNAME,
    Permissions.POS_VIEW,
    Permissions.SALE_CREATE,
    Permissions.SALE_COMPLETE,
    Permissions.SALE_REFUND,
    Permissions.SALE_CANCEL,
    Permissions.PURCHASE_VIEW,
    Permissions.PURCHASE_CREATE,
    Permissions.PURCHASE_EDIT,
    Permissions.PURCHASE_APPROVE,
    Permissions.PURCHASE_RECEIVE,
    Permissions.PURCHASE_CANCEL,
    Permissions.TRANSFER_VIEW,
    Permissions.TRANSFER_CREATE,
    Permissions.TRANSFER_SHIP,
    Permissions.TRANSFER_RECEIVE,
    Permissions.REPORT_VIEW,
    Permissions.REPORT_EXPORT,
    Permissions.FINANCE_VIEW,
    Permissions.FINANCE_CREATE,
    Permissions.FINANCE_EDIT,
    Permissions.EMPLOYEE_VIEW,
    Permissions.SETTINGS_VIEW,
  ],

  [Roles.CASHIER]: [
    Permissions.DASHBOARD_VIEW,
    Permissions.PRODUCT_VIEW,
    Permissions.CUSTOMER_VIEW,
    Permissions.CUSTOMER_CREATE,
    Permissions.CUSTOMER_EDIT,
    Permissions.POS_VIEW,
    Permissions.SALE_CREATE,
    Permissions.SALE_COMPLETE,
  ],

  [Roles.WAREHOUSE]: [
    Permissions.DASHBOARD_VIEW,
    Permissions.PRODUCT_VIEW,
    Permissions.SUPPLIER_VIEW,
    Permissions.INVENTORY_VIEW,
    Permissions.INVENTORY_STOCK_IN,
    Permissions.INVENTORY_STOCK_OUT,
    Permissions.INVENTORY_ADJUSTMENT,
    Permissions.INVENTORY_OPNAME,
    Permissions.PURCHASE_VIEW,
    Permissions.PURCHASE_RECEIVE,
    Permissions.TRANSFER_VIEW,
    Permissions.TRANSFER_CREATE,
    Permissions.TRANSFER_SHIP,
    Permissions.TRANSFER_RECEIVE,
  ],
}
