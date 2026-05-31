# SCHEMA_PRISMA_RULES.md

Version: V1-V2

---

# GENERAL RULES

All tables use:

id String @id @default(cuid())

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

---

# MULTI TENANT

Every business entity contains:

tenantId String

tenant Tenant @relation(...)

---

# SOFT DELETE

deletedAt DateTime?

Required for:

User

Product

Customer

Supplier

---

# ENUMS

enum UserStatus {
 ACTIVE
 SUSPENDED
 INVITED
}

enum SaleStatus {
 DRAFT
 COMPLETED
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
 IN_TRANSIT
 RECEIVED
 CANCELLED
}

enum InventoryMovementType {
 PURCHASE
 SALE
 ADJUSTMENT
 TRANSFER_IN
 TRANSFER_OUT
 RETURN
 STOCK_OPNAME
}

---

# INDEX RULES

@@index([tenantId])

on every table

---

# UNIQUE RULES

Product

@@unique([tenantId, sku])

@@unique([tenantId, barcode])

Customer

@@unique([tenantId, phone])

Sale

@@unique([tenantId, invoiceNumber])

---

# RELATION RULES

Never use implicit many-to-many.

Always use junction tables.

---

# AUDIT LOG

JSON fields allowed:

oldValue Json?

newValue Json?

---

# MONEY

Always use Decimal

Never Float

Example:

costPrice Decimal

sellingPrice Decimal

total Decimal

subtotal Decimal

---

# STOCK

Never store stock inside Product.

Stock exists only in:

inventoryBalances

inventoryMovements