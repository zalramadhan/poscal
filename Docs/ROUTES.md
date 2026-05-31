# ROUTES.md

Version: V1-V2

Framework: Next.js 15 App Router

---

# PUBLIC

/

/pricing

/features

/contact

/privacy

/terms

---

# AUTH

/auth/login

/auth/register

/auth/forgot-password

/auth/reset-password

---

# APP

/app

redirect -> /app/dashboard

---

# DASHBOARD

/app/dashboard

---

# POS

/app/pos

/app/pos/history

/app/pos/history/[id]

---

# PRODUCTS

/app/products

/app/products/create

/app/products/[id]

/app/products/[id]/edit

---

# CATEGORIES

/app/categories

---

# BRANDS

/app/brands

---

# CUSTOMERS

/app/customers

/app/customers/create

/app/customers/[id]

/app/customers/[id]/edit

---

# SUPPLIERS

/app/suppliers

/app/suppliers/create

/app/suppliers/[id]

/app/suppliers/[id]/edit

---

# INVENTORY

/app/inventory

/app/inventory/movements

/app/inventory/stock-in

/app/inventory/stock-out

/app/inventory/adjustment

/app/inventory/opname

---

# PURCHASES

/app/purchases

/app/purchases/create

/app/purchases/[id]

---

# WAREHOUSES

/app/warehouses

/app/warehouses/[id]

---

# TRANSFERS

/app/transfers

/app/transfers/create

/app/transfers/[id]

---

# REPORTS

/app/reports

/app/reports/sales

/app/reports/inventory

/app/reports/purchases

/app/reports/finance

---

# FINANCE

/app/finance

/app/finance/income

/app/finance/expenses

/app/finance/cashflow

---

# EMPLOYEES

/app/employees

/app/employees/create

/app/employees/[id]

---

# SETTINGS

/app/settings

/app/settings/company

/app/settings/branches

/app/settings/users

/app/settings/roles

/app/settings/subscription

---

# FUTURE V3

/app/ai

/app/ai/insights

/app/ai/inventory

/app/ai/sales

/app/ai/marketing

---

# FUTURE V4

/app/agents

/app/agents/purchasing

/app/agents/inventory

/app/agents/executive