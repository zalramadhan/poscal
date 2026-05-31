# PRISMA_SCHEMA_SPEC.md

Version: V1-V2

Status: Ready For Schema Generation

---

# ENUMS

enum UserStatus {
INVITED
ACTIVE
SUSPENDED
}

enum SaleStatus {
DRAFT
HOLD
COMPLETED
CANCELLED
REFUNDED
}

enum PurchaseOrderStatus {
DRAFT
APPROVED
ORDERED
RECEIVED
COMPLETED
CANCELLED
}

enum TransferStatus {
DRAFT
APPROVAL_PENDING
APPROVED
IN_TRANSIT
RECEIVED
CANCELLED
}

enum StockOpnameStatus {
DRAFT
SUBMITTED
APPROVED
COMPLETED
REJECTED
}

enum InventoryMovementType {
PURCHASE
SALE
RETURN
ADJUSTMENT
TRANSFER_IN
TRANSFER_OUT
STOCK_OPNAME
}

enum RestaurantTableStatus {
AVAILABLE
OCCUPIED
RESERVED
CLEANING
}

enum KitchenOrderStatus {
NEW
PREPARING
READY
SERVED
COMPLETED
CANCELLED
}

---

# CORE MODELS

Tenant

Relations:

* Users
* Roles
* Branches
* Warehouses
* Products
* Customers
* Suppliers

Role

Relations:

* Users
* Permissions

Permission

Relations:

* Roles

User

Relations:

* Tenant
* Role
* Branch

Branch

Relations:

* Tenant
* Warehouses
* Users

Warehouse

Relations:

* Branch
* InventoryBalances
* InventoryMovements

---

# PRODUCT MODELS

Category

Brand

Unit

Product

Relations:

* Category
* Brand
* Unit
* InventoryBalances
* InventoryMovements
* SaleItems
* PurchaseOrderItems

ProductImage

Relations:

* Product

---

# CUSTOMER MODELS

Customer

CustomerAddress

Relations:

* Customer

---

# SUPPLIER MODELS

Supplier

SupplierAddress

Relations:

* Supplier

---

# INVENTORY MODELS

InventoryBalance

Unique:
warehouseId + productId

Relations:

* Product
* Warehouse

InventoryMovement

Relations:

* Product
* Warehouse
* User

StockOpname

Relations:

* Warehouse
* User
* StockOpnameItems

StockOpnameItem

Relations:

* StockOpname
* Product

---

# SALES MODELS

Sale

Relations:

* Customer
* Branch
* SaleItems
* Payments

SaleItem

Relations:

* Sale
* Product

PaymentMethod

Relations:

* Payments

Payment

Relations:

* Sale
* PaymentMethod

---

# PURCHASING MODELS

PurchaseOrder

Relations:

* Supplier
* Warehouse
* PurchaseOrderItems

PurchaseOrderItem

Relations:

* PurchaseOrder
* Product

---

# TRANSFER MODELS

StockTransfer

Relations:

* FromWarehouse
* ToWarehouse
* StockTransferItems

StockTransferItem

Relations:

* StockTransfer
* Product

---

# FINANCE MODELS

Income

Relations:

* Branch

Expense

Relations:

* Branch

---

# RESTAURANT MODELS

RestaurantTable

Relations:

* Branch

MenuCategory

Relations:

* Menus

Menu

Relations:

* MenuCategory
* KitchenOrderItems

MenuModifier

Relations:

* ModifierOptions

MenuModifierOption

Relations:

* MenuModifier

KitchenOrder

Relations:

* RestaurantTable
* Sale
* KitchenOrderItems

KitchenOrderItem

Relations:

* KitchenOrder
* Menu

---

# SYSTEM MODELS

FileUpload

SystemSetting

AuditLog

Relations:

* User

---

# INDEX STRATEGY

Every business table:

@@index([tenantId])

---

Products:

@@unique([tenantId, sku])

@@unique([tenantId, barcode])

---

InventoryBalance:

@@unique([warehouseId, productId])

---

Sales:

@@unique([tenantId, invoiceNumber])

---

PurchaseOrder:

@@unique([tenantId, poNumber])

---

StockTransfer:

@@unique([tenantId, transferNumber])

---

# MONEY RULES

Use:

Decimal @db.Decimal(18,2)

Never Float

Fields:

costPrice

sellingPrice

subtotal

discount

tax

total

amount

quantity

---

# DELETE STRATEGY

Soft Delete:

User
Product
Customer
Supplier
Menu
RestaurantTable

Field:

deletedAt DateTime?

---

# HARD DELETE

Forbidden

Except:

Audit cleanup jobs

Temporary files

---

# SECURITY RULES

Every business model contains:

tenantId String

Mandatory.

Every query must filter:

tenantId

Mandatory.

---

# INVENTORY RULE

InventoryBalance

Snapshot Only

InventoryMovement

Source Of Truth
