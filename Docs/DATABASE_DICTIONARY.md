# DATABASE_DICTIONARY.md

Version: V1-V2

Status: SOURCE OF TRUTH

Framework: PostgreSQL + Prisma

---

# OVERVIEW

Architecture:

Multi Tenant

Shared Database

Shared Schema

Tenant Isolation

---

# GLOBAL COLUMNS

Every business table contains:

id

tenantId

createdAt

updatedAt

---

Soft Delete Tables:

users

products

customers

suppliers

menus

restaurantTables

Use:

deletedAt

---

# TENANTS

Purpose:

Business Owner

Columns:

id String PK

name String

slug String Unique

email String

phone String

status String

createdAt DateTime

updatedAt DateTime

Relations:

users

branches

products

customers

suppliers

warehouses

sales

purchaseOrders

---

# ROLES

Purpose:

RBAC

Columns:

id String PK

tenantId String

name String

description String

createdAt

updatedAt

Relations:

users

rolePermissions

---

# PERMISSIONS

Purpose:

System Permissions

Columns:

id

name

module

action

createdAt

updatedAt

---

# ROLE_PERMISSIONS

Purpose:

Many To Many

Columns:

id

roleId

permissionId

createdAt

---

# USERS

Purpose:

Application Users

Columns:

id

tenantId

roleId

branchId

name

email

passwordHash

status

deletedAt

createdAt

updatedAt

Indexes:

tenantId

email

---

# BRANCHES

Purpose:

Business Branches

Columns:

id

tenantId

name

code

address

phone

isActive

createdAt

updatedAt

---

# WAREHOUSES

Purpose:

Physical Warehouses

Columns:

id

tenantId

branchId

name

code

address

isActive

createdAt

updatedAt

Indexes:

tenantId

branchId

---

# CATEGORIES

Purpose:

Product Categories

Columns:

id

tenantId

name

description

createdAt

updatedAt

---

# BRANDS

Purpose:

Product Brands

Columns:

id

tenantId

name

description

createdAt

updatedAt

---

# UNITS

Purpose:

Product Units

Columns:

id

tenantId

name

symbol

createdAt

updatedAt

Examples:

PCS

BOX

KG

LTR

---

# PRODUCTS

Purpose:

Products

Columns:

id

tenantId

categoryId

brandId

unitId

sku

barcode

name

description

costPrice Decimal

sellingPrice Decimal

image

isActive Boolean

deletedAt

createdAt

updatedAt

Indexes:

tenantId

sku

barcode

Unique:

tenantId + sku

tenantId + barcode

---

# PRODUCT_IMAGES

Purpose:

Additional Images

Columns:

id

productId

url

sortOrder

createdAt

---

# CUSTOMERS

Purpose:

Customer Management

Columns:

id

tenantId

name

phone

email

address

notes

deletedAt

createdAt

updatedAt

Indexes:

tenantId

phone

email

---

# SUPPLIERS

Purpose:

Supplier Management

Columns:

id

tenantId

name

phone

email

address

notes

deletedAt

createdAt

updatedAt

---

# INVENTORY_BALANCES

Purpose:

Current Stock Snapshot

Columns:

id

tenantId

warehouseId

productId

quantity Decimal

updatedAt

Unique:

warehouseId + productId

---

# INVENTORY_MOVEMENTS

Purpose:

Stock Source Of Truth

Columns:

id

tenantId

warehouseId

productId

movementType

quantity

previousStock

currentStock

referenceType

referenceId

notes

createdBy

createdAt

Indexes:

tenantId

warehouseId

productId

createdAt

---

# SALES

Purpose:

POS Transactions

Columns:

id

tenantId

branchId

customerId

invoiceNumber

status

subtotal

discount

tax

total

notes

createdBy

createdAt

updatedAt

Statuses:

DRAFT

HOLD

COMPLETED

CANCELLED

REFUNDED

---

# SALE_ITEMS

Purpose:

Sale Details

Columns:

id

saleId

productId

quantity

price

discount

subtotal

createdAt

---

# PAYMENTS

Purpose:

Split Payment

Columns:

id

saleId

paymentMethodId

amount

referenceNumber

createdAt

---

# PAYMENT_METHODS

Purpose:

Payment Types

Columns:

id

tenantId

name

isActive

createdAt

Examples:

Cash

QRIS

Bank Transfer

Debit Card

Credit Card

---

# PURCHASE_ORDERS

Purpose:

Procurement

Columns:

id

tenantId

supplierId

warehouseId

poNumber

status

subtotal

total

notes

createdBy

createdAt

updatedAt

Statuses:

DRAFT

APPROVED

ORDERED

RECEIVED

COMPLETED

CANCELLED

---

# PURCHASE_ORDER_ITEMS

Purpose:

PO Details

Columns:

id

purchaseOrderId

productId

quantity

costPrice

subtotal

---

# STOCK_TRANSFERS

Purpose:

Warehouse Transfers

Columns:

id

tenantId

fromWarehouseId

toWarehouseId

transferNumber

status

notes

createdBy

createdAt

Statuses:

DRAFT

APPROVAL_PENDING

APPROVED

IN_TRANSIT

RECEIVED

CANCELLED

---

# STOCK_TRANSFER_ITEMS

Columns:

id

stockTransferId

productId

quantity

createdAt

---

# STOCK_OPNAMES

Purpose:

Stock Count

Columns:

id

tenantId

warehouseId

status

notes

createdBy

approvedBy

createdAt

Statuses:

DRAFT

SUBMITTED

APPROVED

COMPLETED

REJECTED

---

# STOCK_OPNAME_ITEMS

Columns:

id

stockOpnameId

productId

systemQty

actualQty

differenceQty

createdAt

---

# INCOME

Purpose:

Finance Lite

Columns:

id

tenantId

branchId

amount

category

description

date

createdAt

---

# EXPENSES

Purpose:

Finance Lite

Columns:

id

tenantId

branchId

amount

category

description

date

createdAt

---

# RESTAURANT_TABLES

Purpose:

Restaurant Tables

Columns:

id

tenantId

branchId

name

capacity

status

createdAt

Statuses:

AVAILABLE

OCCUPIED

RESERVED

CLEANING

---

# MENU_CATEGORIES

Purpose:

Restaurant Menu Categories

Columns:

id

tenantId

name

createdAt

---

# MENUS

Purpose:

Restaurant Menu

Columns:

id

tenantId

menuCategoryId

name

description

price

image

isActive

deletedAt

createdAt

updatedAt

---

# MENU_MODIFIERS

Purpose:

Extra Options

Columns:

id

tenantId

name

createdAt

Examples:

Extra Cheese

Extra Egg

Spicy Level

---

# MENU_MODIFIER_OPTIONS

Columns:

id

modifierId

name

priceAdjustment

createdAt

---

# KITCHEN_ORDERS

Purpose:

Kitchen Workflow

Columns:

id

tenantId

tableId

saleId

status

createdAt

Statuses:

NEW

PREPARING

READY

SERVED

COMPLETED

CANCELLED

---

# KITCHEN_ORDER_ITEMS

Columns:

id

kitchenOrderId

menuId

quantity

notes

createdAt

---

# FILE_UPLOADS

Purpose:

Media Storage

Columns:

id

tenantId

fileName

fileUrl

mimeType

fileSize

uploadedBy

createdAt

---

# SYSTEM_SETTINGS

Purpose:

Tenant Configuration

Columns:

id

tenantId

key

value

createdAt

updatedAt

---

# AUDIT_LOGS

Purpose:

Immutable Audit Trail

Columns:

id

tenantId

userId

entity

entityId

action

oldValue Json

newValue Json

createdAt

Indexes:

tenantId

entity

createdAt

---

# BUSINESS RULES

InventoryMovement

=

Source Of Truth

---

Negative Stock

=

Forbidden

---

Refund

=

Restore Stock

---

Purchase Receive

=

Increase Stock

---

Transfer Out

=

Decrease Source Warehouse

---

Transfer In

=

Increase Destination Warehouse

---

Audit Logs

=

Required

---

Tenant Isolation

=

Mandatory

---

RBAC Validation

=

Mandatory
