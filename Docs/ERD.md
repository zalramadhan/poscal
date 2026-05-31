# ERD.md

Version: V1-V2

Status: Source of Truth

---

# OVERVIEW

POS AI uses Multi Tenant Architecture.

Every business entity belongs to a tenant.

---

# RELATIONSHIP MAP

TENANT

└── USERS

└── ROLES

└── BRANCHES

└── WAREHOUSES

└── PRODUCTS

└── CUSTOMERS

└── SUPPLIERS

└── SALES

└── PURCHASE_ORDERS

└── INVENTORY_MOVEMENTS

---

# AUTH DOMAIN

tenants

1:N

users

---

roles

1:N

users

---

branches

1:N

users

---

# PRODUCT DOMAIN

categories

1:N

products

---

brands

1:N

products

---

units

1:N

products

---

products

1:N

sale_items

---

products

1:N

purchase_order_items

---

products

1:N

inventory_movements

---

products

1:N

inventory_balances

---

# CUSTOMER DOMAIN

customers

1:N

sales

---

memberships

1:N

customers

---

# SUPPLIER DOMAIN

suppliers

1:N

purchase_orders

---

# SALES DOMAIN

sales

1:N

sale_items

---

sales

1:N

inventory_movements

(reference_id)

---

users

1:N

sales

(created_by)

---

# PURCHASE DOMAIN

purchase_orders

1:N

purchase_order_items

---

purchase_orders

1:N

inventory_movements

(reference_id)

---

users

1:N

purchase_orders

(created_by)

---

# WAREHOUSE DOMAIN

branches

1:N

warehouses

---

warehouses

1:N

inventory_balances

---

warehouses

1:N

inventory_movements

---

warehouses

1:N

stock_transfers

(from)

---

warehouses

1:N

stock_transfers

(to)

---

# STOCK TRANSFER DOMAIN

stock_transfers

1:N

stock_transfer_items

---

stock_transfers

2 inventory movements

TRANSFER_OUT

TRANSFER_IN

---

# INVENTORY DOMAIN

inventory_balances

Current Snapshot

---

inventory_movements

Source of Truth

---

Relationship

warehouse_id

*

product_id

↓

inventory_balances

---

# AUDIT DOMAIN

users

1:N

audit_logs

---

audit_logs

Stores:

* entity
* action
* old_value
* new_value

For all critical actions.

---

# ERD PRINCIPLES

1.

Never store stock inside products table.

---

2.

Inventory movements are immutable.

Never edit historical movement.

---

3.

Inventory balances are generated data.

Inventory movements are source of truth.

---

4.

Every business record must contain:

tenant_id

Mandatory.

---

5.

Every transaction must be traceable.

From:

Receipt

↓

Sale

↓

Inventory Movement

↓

Audit Log
