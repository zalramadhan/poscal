# PERMISSION_MATRIX_DETAILED.md

Version: V1-V2

Status: Source of Truth

---

LEGEND

V = View

C = Create

E = Edit

D = Delete

A = Approve

X = No Access

---

# DASHBOARD

| Role      | Access |
| --------- | ------ |
| Owner     | V      |
| Manager   | V      |
| Cashier   | V      |
| Warehouse | V      |

---

# PRODUCTS

| Action | Owner | Manager | Cashier | Warehouse |
| ------ | ----- | ------- | ------- | --------- |
| View   | V     | V       | V       | V         |
| Create | C     | C       | X       | X         |
| Edit   | E     | E       | X       | X         |
| Delete | D     | D       | X       | X         |

---

# CATEGORIES

| Action | Owner | Manager | Cashier | Warehouse |
| ------ | ----- | ------- | ------- | --------- |
| View   | V     | V       | X       | X         |
| Create | C     | C       | X       | X         |
| Edit   | E     | E       | X       | X         |
| Delete | D     | D       | X       | X         |

---

# SUPPLIERS

| Action | Owner | Manager | Cashier | Warehouse |
| ------ | ----- | ------- | ------- | --------- |
| View   | V     | V       | X       | V         |
| Create | C     | C       | X       | X         |
| Edit   | E     | E       | X       | X         |
| Delete | D     | D       | X       | X         |

---

# CUSTOMERS

| Action | Owner | Manager | Cashier | Warehouse |
| ------ | ----- | ------- | ------- | --------- |
| View   | V     | V       | V       | X         |
| Create | C     | C       | C       | X         |
| Edit   | E     | E       | E       | X         |
| Delete | D     | D       | X       | X         |

---

# INVENTORY

| Action     | Owner | Manager | Cashier | Warehouse |
| ---------- | ----- | ------- | ------- | --------- |
| View       | V     | V       | X       | V         |
| Stock In   | C     | C       | X       | C         |
| Stock Out  | C     | C       | X       | C         |
| Adjustment | C     | C       | X       | C         |
| Opname     | C     | C       | X       | C         |

---

# POS

| Action        | Owner | Manager | Cashier | Warehouse |
| ------------- | ----- | ------- | ------- | --------- |
| View          | V     | V       | V       | X         |
| Create Sale   | C     | C       | C       | X         |
| Complete Sale | C     | C       | C       | X         |
| Refund        | C     | C       | X       | X         |
| Cancel        | C     | C       | X       | X         |

---

# PURCHASE ORDERS

| Action  | Owner | Manager | Cashier | Warehouse |
| ------- | ----- | ------- | ------- | --------- |
| View    | V     | V       | X       | V         |
| Create  | C     | C       | X       | X         |
| Edit    | E     | E       | X       | X         |
| Approve | A     | A       | X       | X         |
| Receive | C     | C       | X       | C         |
| Cancel  | C     | C       | X       | X         |

---

# STOCK TRANSFERS

| Action  | Owner | Manager | Cashier | Warehouse |
| ------- | ----- | ------- | ------- | --------- |
| View    | V     | V       | X       | V         |
| Create  | C     | C       | X       | C         |
| Ship    | C     | C       | X       | C         |
| Receive | C     | C       | X       | C         |

---

# REPORTS

| Action | Owner | Manager | Cashier | Warehouse |
| ------ | ----- | ------- | ------- | --------- |
| View   | V     | V       | X       | X         |
| Export | V     | V       | X       | X         |

---

# FINANCE

| Action | Owner | Manager | Cashier | Warehouse |
| ------ | ----- | ------- | ------- | --------- |
| View   | V     | V       | X       | X         |
| Create | C     | C       | X       | X         |
| Edit   | E     | E       | X       | X         |

---

# EMPLOYEES

| Action | Owner | Manager | Cashier | Warehouse |
| ------ | ----- | ------- | ------- | --------- |
| View   | V     | V       | X       | X         |
| Create | C     | X       | X       | X         |
| Edit   | E     | X       | X       | X         |
| Delete | D     | X       | X       | X         |

---

# SETTINGS

| Action | Owner | Manager | Cashier | Warehouse |
| ------ | ----- | ------- | ------- | --------- |
| View   | V     | X       | X       | X         |
| Edit   | E     | X       | X       | X         |

---

# API SECURITY RULE

Frontend hiding buttons is NOT security.

Backend must validate permissions.

Always.

---

# PRIORITY ORDER

1. Tenant Isolation

2. Permission Validation

3. Business Validation

4. UI Restrictions

Security before UX.
