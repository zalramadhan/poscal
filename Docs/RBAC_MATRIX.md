# RBAC_MATRIX.md

Version: V1-V2

---

ROLES

1. Owner
2. Manager
3. Cashier
4. Warehouse Staff

---

OWNER

Access:

✓ Everything

---

MANAGER

Dashboard

✓ View

Products

✓ CRUD

Inventory

✓ CRUD

Sales

✓ View

✓ Refund

Purchases

✓ CRUD

Reports

✓ View

Employees

✓ View

---

CASHIER

Dashboard

✓ View

POS

✓ Create Sale

✓ Complete Sale

Products

✓ View

Customers

✓ View

Reports

✗

Purchases

✗

Warehouse

✗

---

WAREHOUSE STAFF

Products

✓ View

Inventory

✓ CRUD

Warehouse

✓ CRUD

Stock Transfer

✓ CRUD

Sales

✗

Finance

✗

---

PERMISSION RULE

Frontend permission is not enough.

Backend validation mandatory.
