-- POS AI - Supabase Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/byitvkqkckhusyiiwdmz/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TENANT
CREATE TABLE "Tenant" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'starter',
  status TEXT DEFAULT 'active',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ROLE
CREATE TABLE "Role" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Role"("tenantId");

-- PERMISSION
CREATE TABLE "Permission" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ROLE PERMISSION
CREATE TABLE "RolePermission" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "roleId" TEXT NOT NULL REFERENCES "Role"(id) ON DELETE CASCADE,
  "permissionId" TEXT NOT NULL REFERENCES "Permission"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("roleId", "permissionId")
);

-- USER
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "roleId" TEXT NOT NULL REFERENCES "Role"(id),
  "branchId" TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "User"("tenantId");
CREATE INDEX ON "User"("email");

-- BRANCH
CREATE TABLE "Branch" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Branch"("tenantId");

-- Add foreign key for User.branchId
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"(id);

-- WAREHOUSE
CREATE TABLE "Warehouse" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "branchId" TEXT NOT NULL REFERENCES "Branch"(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Warehouse"("tenantId");
CREATE INDEX ON "Warehouse"("branchId");

-- CATEGORY
CREATE TABLE "Category" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Category"("tenantId");

-- BRAND
CREATE TABLE "Brand" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Brand"("tenantId");

-- UNIT
CREATE TABLE "Unit" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Unit"("tenantId");

-- PRODUCT
CREATE TABLE "Product" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "categoryId" TEXT REFERENCES "Category"(id),
  "brandId" TEXT REFERENCES "Brand"(id),
  "unitId" TEXT REFERENCES "Unit"(id),
  sku TEXT NOT NULL,
  barcode TEXT,
  name TEXT NOT NULL,
  description TEXT,
  "costPrice" DECIMAL(18,2) NOT NULL,
  "sellingPrice" DECIMAL(18,2) NOT NULL,
  image TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "minStock" DECIMAL(18,2),
  "maxStock" DECIMAL(18,2),
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("tenantId", sku),
  UNIQUE("tenantId", barcode)
);

CREATE INDEX ON "Product"("tenantId");

-- PRODUCT IMAGE
CREATE TABLE "ProductImage" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "productId" TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "sortOrder" INT DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "ProductImage"("productId");

-- CUSTOMER
CREATE TABLE "Customer" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  points INT DEFAULT 0,
  tier TEXT DEFAULT 'regular',
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Customer"("tenantId");
CREATE INDEX ON "Customer"("phone");
CREATE INDEX ON "Customer"("email");

-- SUPPLIER
CREATE TABLE "Supplier" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Supplier"("tenantId");
CREATE INDEX ON "Supplier"("phone");

-- INVENTORY BALANCE
CREATE TABLE "InventoryBalance" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL REFERENCES "Warehouse"(id),
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  quantity DECIMAL(18,2) NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("warehouseId", "productId")
);

CREATE INDEX ON "InventoryBalance"("tenantId");
CREATE INDEX ON "InventoryBalance"("warehouseId");
CREATE INDEX ON "InventoryBalance"("productId");

-- INVENTORY MOVEMENT
CREATE TABLE "InventoryMovement" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL REFERENCES "Warehouse"(id),
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  "movementType" TEXT NOT NULL,
  quantity DECIMAL(18,2) NOT NULL,
  "previousStock" DECIMAL(18,2) NOT NULL,
  "currentStock" DECIMAL(18,2) NOT NULL,
  "referenceType" TEXT,
  "referenceId" TEXT,
  notes TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "InventoryMovement"("tenantId");
CREATE INDEX ON "InventoryMovement"("warehouseId");
CREATE INDEX ON "InventoryMovement"("productId");
CREATE INDEX ON "InventoryMovement"("createdAt");

-- STOCK OPNAME
CREATE TABLE "StockOpname" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "warehouseId" TEXT NOT NULL REFERENCES "Warehouse"(id),
  status TEXT DEFAULT 'DRAFT',
  notes TEXT,
  "createdBy" TEXT NOT NULL,
  "approvedBy" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "StockOpname"("tenantId");
CREATE INDEX ON "StockOpname"("warehouseId");

-- STOCK OPNAME ITEM
CREATE TABLE "StockOpnameItem" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "stockOpnameId" TEXT NOT NULL REFERENCES "StockOpname"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  "systemQty" DECIMAL(18,2) NOT NULL,
  "actualQty" DECIMAL(18,2) NOT NULL,
  "differenceQty" DECIMAL(18,2) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "StockOpnameItem"("stockOpnameId");
CREATE INDEX ON "StockOpnameItem"("productId");

-- PAYMENT METHOD
CREATE TABLE "PaymentMethod" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "PaymentMethod"("tenantId");

-- SALE
CREATE TABLE "Sale" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "branchId" TEXT NOT NULL REFERENCES "Branch"(id),
  "customerId" TEXT REFERENCES "Customer"(id),
  "invoiceNumber" TEXT NOT NULL,
  subtotal DECIMAL(18,2) NOT NULL,
  discount DECIMAL(18,2) NOT NULL,
  tax DECIMAL(18,2) NOT NULL,
  total DECIMAL(18,2) NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'DRAFT',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("tenantId", "invoiceNumber")
);

CREATE INDEX ON "Sale"("tenantId");
CREATE INDEX ON "Sale"("createdAt");

-- SALE ITEM
CREATE TABLE "SaleItem" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "saleId" TEXT NOT NULL REFERENCES "Sale"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  quantity DECIMAL(18,2) NOT NULL,
  price DECIMAL(18,2) NOT NULL,
  discount DECIMAL(18,2) DEFAULT 0,
  subtotal DECIMAL(18,2) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "SaleItem"("saleId");
CREATE INDEX ON "SaleItem"("productId");

-- PAYMENT
CREATE TABLE "Payment" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "saleId" TEXT NOT NULL REFERENCES "Sale"(id) ON DELETE CASCADE,
  "paymentMethodId" TEXT NOT NULL REFERENCES "PaymentMethod"(id),
  amount DECIMAL(18,2) NOT NULL,
  "referenceNumber" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Payment"("saleId");

-- PURCHASE ORDER
CREATE TABLE "PurchaseOrder" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "supplierId" TEXT NOT NULL REFERENCES "Supplier"(id),
  "warehouseId" TEXT NOT NULL REFERENCES "Warehouse"(id),
  "poNumber" TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT',
  subtotal DECIMAL(18,2) NOT NULL,
  total DECIMAL(18,2) NOT NULL,
  notes TEXT,
  "expectedDate" TIMESTAMPTZ,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("tenantId", "poNumber")
);

CREATE INDEX ON "PurchaseOrder"("tenantId");

-- PURCHASE ORDER ITEM
CREATE TABLE "PurchaseOrderItem" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "purchaseOrderId" TEXT NOT NULL REFERENCES "PurchaseOrder"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  quantity DECIMAL(18,2) NOT NULL,
  "costPrice" DECIMAL(18,2) NOT NULL,
  subtotal DECIMAL(18,2) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "PurchaseOrderItem"("purchaseOrderId");
CREATE INDEX ON "PurchaseOrderItem"("productId");

-- STOCK TRANSFER
CREATE TABLE "StockTransfer" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "fromWarehouseId" TEXT NOT NULL REFERENCES "Warehouse"(id),
  "toWarehouseId" TEXT NOT NULL REFERENCES "Warehouse"(id),
  "transferNumber" TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT',
  notes TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("tenantId", "transferNumber")
);

CREATE INDEX ON "StockTransfer"("tenantId");

-- STOCK TRANSFER ITEM
CREATE TABLE "StockTransferItem" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "stockTransferId" TEXT NOT NULL REFERENCES "StockTransfer"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  quantity DECIMAL(18,2) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "StockTransferItem"("stockTransferId");
CREATE INDEX ON "StockTransferItem"("productId");

-- INCOME
CREATE TABLE "Income" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "branchId" TEXT NOT NULL REFERENCES "Branch"(id),
  amount DECIMAL(18,2) NOT NULL,
  category TEXT,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Income"("tenantId");
CREATE INDEX ON "Income"("branchId");

-- EXPENSE
CREATE TABLE "Expense" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "branchId" TEXT NOT NULL REFERENCES "Branch"(id),
  amount DECIMAL(18,2) NOT NULL,
  category TEXT,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Expense"("tenantId");
CREATE INDEX ON "Expense"("branchId");

-- MEMBERSHIP
CREATE TABLE "Membership" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "minimumPoints" INT NOT NULL,
  "discountPercentage" DECIMAL(5,2) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Membership"("tenantId");

-- FILE UPLOAD
CREATE TABLE "FileUpload" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "FileUpload"("tenantId");

-- SYSTEM SETTING
CREATE TABLE "SystemSetting" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("tenantId", key)
);

CREATE INDEX ON "SystemSetting"("tenantId");

-- AUDIT LOG
CREATE TABLE "AuditLog" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL,
  entity TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  action TEXT NOT NULL,
  "oldValue" JSONB,
  "newValue" JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "AuditLog"("tenantId");
CREATE INDEX ON "AuditLog"(entity);
CREATE INDEX ON "AuditLog"("createdAt");

-- RESTAURANT TABLE
CREATE TABLE "RestaurantTable" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "branchId" TEXT NOT NULL REFERENCES "Branch"(id),
  name TEXT NOT NULL,
  capacity INT,
  status TEXT DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "RestaurantTable"("tenantId");
CREATE INDEX ON "RestaurantTable"("branchId");

-- MENU CATEGORY
CREATE TABLE "MenuCategory" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "MenuCategory"("tenantId");

-- MENU
CREATE TABLE "Menu" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "menuCategoryId" TEXT NOT NULL REFERENCES "MenuCategory"(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(18,2) NOT NULL,
  image TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "Menu"("tenantId");

-- KITCHEN ORDER
CREATE TABLE "KitchenOrder" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "tableId" TEXT REFERENCES "RestaurantTable"(id),
  "saleId" TEXT,
  status TEXT DEFAULT 'NEW',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "KitchenOrder"("tenantId");

-- KITCHEN ORDER ITEM
CREATE TABLE "KitchenOrderItem" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "kitchenOrderId" TEXT NOT NULL REFERENCES "KitchenOrder"(id) ON DELETE CASCADE,
  "menuId" TEXT NOT NULL REFERENCES "Menu"(id),
  quantity INT NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON "KitchenOrderItem"("kitchenOrderId");
CREATE INDEX ON "KitchenOrderItem"("menuId");

-- Insert default tenant for testing
INSERT INTO "Tenant" (id, name, slug, email, status) 
VALUES ('default-tenant', 'Default Tenant', 'default', 'admin@poscal.com', 'active');

-- Insert default role
INSERT INTO "Role" (id, "tenantId", name, description)
VALUES ('default-role', 'default-tenant', 'Admin', 'Administrator role');

-- Insert default user (password: admin123)
INSERT INTO "User" (id, "tenantId", "roleId", name, email, "passwordHash", status)
VALUES ('default-user', 'default-tenant', 'default-role', 'Admin', 'admin@poscal.com', '$2a$10$YourHashHere', 'ACTIVE');
