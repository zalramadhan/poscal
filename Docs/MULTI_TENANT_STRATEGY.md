# MULTI_TENANT_STRATEGY.md

Version: V1-V2

Status: Critical

---

# OVERVIEW

POS AI uses:

Shared Database

Shared Schema

Tenant Isolation

Architecture.

---

# TENANT DEFINITION

One Tenant = One Business

Examples:

Tenant A

PT Maju Jaya

Tenant B

Toko Sumber Rejeki

Tenant C

CV Sentosa

---

Each tenant owns:

* Users
* Branches
* Warehouses
* Products
* Customers
* Suppliers
* Sales
* Purchases
* Reports

---

# TENANT ISOLATION RULE

Every business table must contain:

tenant_id

Mandatory.

---

Example

products

tenant_id

name

price

---

sales

tenant_id

invoice_number

total

---

# QUERY RULE

Every query must filter:

tenant_id

Example:

WHERE tenant_id = currentTenantId

---

Forbidden:

SELECT * FROM products

Allowed:

SELECT * FROM products
WHERE tenant_id = currentTenantId

---

# TENANT RESOLUTION

Current Tenant is determined by:

Authenticated User

↓

user.tenant_id

---

# LOGIN FLOW

User Login

↓

Load User

↓

Load Tenant

↓

Store Session

↓

Grant Access

---

# TENANT CREATION FLOW

Register Company

↓

Create Tenant

↓

Create Owner Role

↓

Create Owner User

↓

Create Default Branch

↓

Create Default Warehouse

↓

Create Trial Subscription

---

# DEFAULT DATA

On Tenant Creation

Create:

Owner Role

Manager Role

Cashier Role

Warehouse Staff Role

---

Default Branch

Main Branch

---

Default Warehouse

Main Warehouse

---

# SUBSCRIPTION MODEL

Tenant

1

↓

1

Subscription

---

Subscription Fields

* Plan
* Status
* Start Date
* End Date

---

Plans

Starter

Growth

Business

Enterprise

---

# FEATURE LIMITS

Starter

1 Branch

1 Warehouse

5 Users

---

Growth

5 Branches

5 Warehouses

20 Users

---

Business

Unlimited

---

# BRANCH STRATEGY

Tenant

↓

Branches

1:N

---

Branch owns:

Sales

Users

Reports

---

# WAREHOUSE STRATEGY

Branch

↓

Warehouses

1:N

---

Warehouse owns:

Inventory

Movements

Transfers

---

# SOFT DELETE STRATEGY

Required.

Use:

deleted_at

Never hard delete:

Products

Customers

Suppliers

Users

---

# SECURITY RULES

Tenant A

Must never access

Tenant B Data

Even if:

* ID Known
* URL Modified
* API Called Directly

Server Validation Required.

---

# TENANT MIDDLEWARE

Every request must validate:

User Exists

↓

Tenant Exists

↓

Subscription Active

↓

Permission Valid

↓

Continue

Else Reject.

---

# AUDIT REQUIREMENT

Every audit log must include:

tenant_id

Mandatory.

---

# FUTURE COMPATIBILITY

Architecture must support:

* Unlimited Tenants
* Unlimited Branches
* Unlimited Warehouses
* AI Modules
* Marketplace Integration

Without schema redesign.
