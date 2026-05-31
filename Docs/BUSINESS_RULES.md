# BUSINESS_RULES.md

Version: V1-V2

Status: SOURCE OF TRUTH

---

# GLOBAL RULES

All business entities belong to a Tenant.

All operations must validate:

- Tenant
- User
- Permission

Before execution.

---

# INVENTORY RULES

InventoryMovement

is source of truth.

InventoryBalance

is generated snapshot.

Never modify historical inventory movement.

Never delete inventory movement.

---

# NEGATIVE STOCK

Disabled.

Stock cannot become negative.

Example:

Current Stock = 5

Sell = 10

Result:

Rejected

Reason:

Insufficient stock.

---

# SALE RULES

Status:

DRAFT

HOLD

COMPLETED

CANCELLED

REFUNDED

---

Allowed:

DRAFT → COMPLETED

DRAFT → CANCELLED

HOLD → COMPLETED

HOLD → CANCELLED

COMPLETED → REFUNDED

---

Effects

COMPLETED

- Reduce stock
- Create inventory movement
- Create audit log

---

REFUNDED

- Restore stock
- Create return movement
- Create audit log

---

# SPLIT PAYMENT

Supported.

Example:

Total = 100.000

Cash = 50.000

QRIS = 50.000

Total Payments must equal Sale Total.

---

# PURCHASE ORDER

Status:

DRAFT

APPROVED

ORDERED

RECEIVED

COMPLETED

CANCELLED

---

RECEIVED

Creates:

Inventory Movements

Updates:

Inventory Balance

---

# STOCK TRANSFER

Status:

DRAFT

APPROVAL_PENDING

APPROVED

IN_TRANSIT

RECEIVED

CANCELLED

---

Transfer Out

Reduces Source Warehouse

Transfer In

Adds Destination Warehouse

---

# STOCK OPNAME

Status:

DRAFT

SUBMITTED

APPROVED

COMPLETED

REJECTED

---

Only Manager or Owner can approve.

---

# FINANCE LITE

Income

Expense

Cashflow

No Double Entry Accounting.

---

# RESTAURANT

Order Status:

NEW

PREPARING

READY

SERVED

COMPLETED

CANCELLED

---

Kitchen receives orders only after payment confirmation or hold order creation.

---

# TABLE MANAGEMENT

Table Status:

AVAILABLE

OCCUPIED

RESERVED

CLEANING

---

# MENU MODIFIER

Supported.

Example:

Nasi Goreng

+ Telur

+ Ayam

+ Extra Pedas

---

Modifiers affect pricing.

---

# AUDIT LOG

Required for:

Product

Inventory

Sale

Purchase

Transfer

User

Settings

---

Audit log is immutable.

---

# SOFT DELETE

Required:

Products

Customers

Suppliers

Users

Menus

Tables

---

Hard Delete

Forbidden.