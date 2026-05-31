# API_SPEC.md

Version: V1-V2

Status: Source of Truth

---

# API STANDARDS

Base URL

/api/v1

Response Format

Success

{
"success": true,
"message": "Operation successful",
"data": {}
}

Error

{
"success": false,
"message": "Validation failed",
"errors": {}
}

---

# AUTH

POST /auth/register

POST /auth/login

POST /auth/logout

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/me

---

# DASHBOARD

GET /dashboard/summary

Response:

* revenueToday
* salesToday
* totalProducts
* lowStockCount

---

# PRODUCTS

GET /products

GET /products/:id

POST /products

PUT /products/:id

DELETE /products/:id

Filters:

* search
* category
* brand
* status

Pagination Required

---

# CATEGORIES

GET /categories

POST /categories

PUT /categories/:id

DELETE /categories/:id

---

# BRANDS

GET /brands

POST /brands

PUT /brands/:id

DELETE /brands/:id

---

# SUPPLIERS

GET /suppliers

GET /suppliers/:id

POST /suppliers

PUT /suppliers/:id

DELETE /suppliers/:id

---

# CUSTOMERS

GET /customers

GET /customers/:id

POST /customers

PUT /customers/:id

DELETE /customers/:id

---

# INVENTORY

GET /inventory

GET /inventory/movements

POST /inventory/stock-in

POST /inventory/stock-out

POST /inventory/adjustment

POST /inventory/opname

---

# SALES

GET /sales

GET /sales/:id

POST /sales

POST /sales/:id/complete

POST /sales/:id/cancel

GET /sales/:id/receipt

---

# PURCHASE ORDERS

GET /purchase-orders

GET /purchase-orders/:id

POST /purchase-orders

PUT /purchase-orders/:id

POST /purchase-orders/:id/approve

POST /purchase-orders/:id/receive

POST /purchase-orders/:id/cancel

---

# WAREHOUSES

GET /warehouses

POST /warehouses

PUT /warehouses/:id

DELETE /warehouses/:id

---

# STOCK TRANSFERS

GET /stock-transfers

POST /stock-transfers

POST /stock-transfers/:id/ship

POST /stock-transfers/:id/receive

---

# REPORTS

GET /reports/sales

GET /reports/inventory

GET /reports/low-stock

GET /reports/purchases

Filters:

* dateFrom
* dateTo
* branch
* warehouse

---

# AUDIT LOGS

GET /audit-logs

Owner Only
