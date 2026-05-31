# FEATURE_BREAKDOWN.md

Version: V1-V2

---

# AUTH

Priority: Critical

Pages:

* Login
* Register
* Forgot Password

Dependencies:

* Users
* Roles

---

# DASHBOARD

Priority: Critical

Pages:

* Dashboard

Widgets:

* Revenue Today
* Sales Today
* Products
* Low Stock

Dependencies:

* Sales
* Inventory

---

# PRODUCTS

Priority: Critical

Pages:

* Product List
* Product Create
* Product Edit
* Product Detail

Dependencies:

* Categories
* Brands
* Units

---

# INVENTORY

Priority: Critical

Pages:

* Inventory Overview
* Stock In
* Stock Out
* Adjustment
* Opname

Dependencies:

* Products
* Warehouses

---

# SUPPLIERS

Priority: High

Pages:

* Supplier List
* Supplier Detail

Dependencies:

None

---

# CUSTOMERS

Priority: High

Pages:

* Customer List
* Customer Detail

Dependencies:

None

---

# SALES

Priority: Critical

Pages:

* POS Screen
* Sales History
* Sale Detail

Dependencies:

* Products
* Inventory
* Customers

---

# PURCHASES

Priority: High

Pages:

* PO List
* PO Detail
* Receive Goods

Dependencies:

* Suppliers
* Warehouses

---

# WAREHOUSE

Priority: High

Pages:

* Warehouse List
* Warehouse Detail

Dependencies:

* Branches

---

# STOCK TRANSFER

Priority: High

Pages:

* Transfer List
* Transfer Detail

Dependencies:

* Warehouses
* Inventory

---

# REPORTS

Priority: High

Pages:

* Sales Report
* Inventory Report
* Purchase Report

Dependencies:

* All Transactions

---

# AUDIT LOG

Priority: Medium

Pages:

* Audit Log

Dependencies:

* Entire System
