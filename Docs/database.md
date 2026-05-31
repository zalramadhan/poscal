# DATABASE.md

Version: V1-V2

Status: Approved

---

# DATABASE PRINCIPLES

Inventory accuracy is the highest priority.

Stock must never be modified directly.

All inventory changes must create stock movement records.

---

# MULTI TENANT MODEL

Every business data table must contain:

tenant_id

No table may access another tenant's data.

---

# CORE TABLES

## tenants

Represents one business.

Fields:

* id
* name
* slug
* email
* phone
* plan
* status
* created_at
* updated_at

---

## users

Fields:

* id
* tenant_id
* branch_id
* role_id
* name
* email
* password_hash
* status
* created_at
* updated_at

---

## roles

Fields:

* id
* tenant_id
* name

Examples:

* owner
* cashier
* manager

---

# MASTER DATA

## categories

* id
* tenant_id
* name
* description

---

## brands

* id
* tenant_id
* name

---

## units

Examples:

* PCS
* BOX
* KG

Fields:

* id
* tenant_id
* name
* code

---

## products

Fields:

* id

* tenant_id

* category_id

* brand_id

* unit_id

* sku

* barcode

* name

* description

* cost_price

* selling_price

* image

* is_active

* created_at

* updated_at

Important:

No stock field stored here.

---

# CUSTOMER

## customers

Fields:

* id

* tenant_id

* code

* name

* phone

* email

* address

* points

* tier

* created_at

* updated_at

---

# SUPPLIER

## suppliers

Fields:

* id

* tenant_id

* code

* name

* phone

* email

* address

* created_at

* updated_at

---

# BRANCHES

## branches

Fields:

* id

* tenant_id

* name

* code

* address

* is_active

---

# WAREHOUSE

## warehouses

Fields:

* id

* tenant_id

* branch_id

* name

* code

* address

* is_active

---

# INVENTORY

## inventory_balances

Current stock snapshot.

Fields:

* id

* tenant_id

* warehouse_id

* product_id

* quantity

Unique:

warehouse_id + product_id

---

## inventory_movements

Most important table.

Every stock change must create record.

Fields:

* id

* tenant_id

* warehouse_id

* product_id

* reference_type

* reference_id

* movement_type

IN
OUT
ADJUSTMENT
TRANSFER_IN
TRANSFER_OUT
SALE
PURCHASE

* quantity

* previous_stock

* current_stock

* notes

* created_by

* created_at

---

# POS

## sales

Fields:

* id

* tenant_id

* branch_id

* customer_id

* invoice_number

* subtotal

* discount

* tax

* total

* payment_method

* status

DRAFT
COMPLETED
VOID

* created_by
* created_at

---

## sale_items

Fields:

* id

* sale_id

* product_id

* quantity

* cost_price

* selling_price

* subtotal

---

# PURCHASE

## purchase_orders

Fields:

* id

* tenant_id

* supplier_id

* warehouse_id

* po_number

* status

DRAFT
APPROVED
ORDERED
RECEIVED
COMPLETED
CANCELLED

* total

* created_by

* created_at

---

## purchase_order_items

Fields:

* id

* purchase_order_id

* product_id

* quantity

* cost_price

* subtotal

---

# STOCK OPNAME

## stock_opnames

Fields:

* id

* tenant_id

* warehouse_id

* opname_number

* status

DRAFT
COMPLETED

* created_by

---

## stock_opname_items

Fields:

* id

* stock_opname_id

* product_id

* system_qty

* actual_qty

* difference

---

# TRANSFER STOCK

## stock_transfers

Fields:

* id

* tenant_id

* from_warehouse_id

* to_warehouse_id

* transfer_number

* status

DRAFT
IN_TRANSIT
RECEIVED

---

## stock_transfer_items

Fields:

* id

* stock_transfer_id

* product_id

* quantity

---

# CRM

## memberships

Fields:

* id

* tenant_id

* name

* minimum_points

* discount_percentage

---

# FINANCE LITE

## expenses

Fields:

* id

* tenant_id

* branch_id

* title

* amount

* expense_date

---

## incomes

Fields:

* id

* tenant_id

* branch_id

* title

* amount

* income_date

---

# AUDIT LOG

## audit_logs

Fields:

* id

* tenant_id

* user_id

* action

* entity

* entity_id

* old_value

* new_value

* created_at

---

# INVENTORY FLOW

Purchase Receive

→ inventory_movements

→ inventory_balances

Stock Transfer

→ inventory_movements

→ inventory_balances

Sale

→ inventory_movements

→ inventory_balances

Stock Opname

→ inventory_movements

→ inventory_balances

Never bypass inventory_movements.

inventory_balances is only a snapshot table.

inventory_movements is the source of truth.
