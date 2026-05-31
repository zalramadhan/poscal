# POS AI

Version: V1-V2

Status: Active Development

---

# PRODUCT OVERVIEW

POS AI adalah platform SaaS berbasis cloud yang menggabungkan:

* Point Of Sale (POS)
* Inventory Management
* Warehouse Management
* Purchasing
* CRM
* Reporting

Target market awal:

* Retail Store
* Toko Kelontong
* Minimarket
* Grosir
* Distributor Kecil

Target release:

V1 + V2

Restaurant module tidak termasuk scope.

Accounting tidak termasuk scope.

AI Features tidak termasuk scope.

---

# BUSINESS GOAL

Membantu bisnis:

* Mengelola transaksi penjualan
* Mengelola stok
* Mengelola supplier
* Mengelola customer
* Mengelola gudang
* Mengelola pembelian

Dalam satu platform.

---

# PRODUCT TYPE

Multi Tenant SaaS

Setiap tenant memiliki:

* Users
* Products
* Customers
* Suppliers
* Warehouses
* Transactions

Data tenant wajib terisolasi.

Tenant tidak boleh mengakses data tenant lain.

---

# V1 SCOPE

## Authentication

Features:

* Login
* Logout
* Register
* Forgot Password
* Reset Password

---

## User Management

Roles:

Owner

Cashier

Permissions:

Owner:

* Full Access

Cashier:

* POS Access Only

---

## Dashboard

Widgets:

* Revenue Today
* Sales Today
* Total Products
* Low Stock

---

## Product Management

Fields:

* Product Name
* SKU
* Barcode
* Category
* Brand
* Cost Price
* Selling Price
* Unit
* Stock
* Image
* Status

CRUD Required.

---

## Category Management

CRUD Required.

---

## Brand Management

CRUD Required.

---

## Supplier Management

Fields:

* Name
* Phone
* Email
* Address

CRUD Required.

---

## Customer Management

Fields:

* Name
* Phone
* Email
* Address

CRUD Required.

---

## Inventory

Features:

* Stock In
* Stock Out
* Stock Adjustment
* Stock Opname
* Stock History

Every stock movement must be logged.

No stock change may occur without history records.

---

## POS

Features:

* Create Sale
* Search Product
* Barcode Scan
* Discount Item
* Discount Order
* Hold Order
* Resume Order
* Cancel Order

Payments:

* Cash
* QRIS
* Transfer

Output:

* Receipt

---

## Reports

Sales Report

Inventory Report

Low Stock Report

Date Filtering Required.

---

# V2 SCOPE

## Multi Branch

Features:

* Create Branch
* Edit Branch
* Disable Branch

Every transaction belongs to a branch.

---

## Warehouse

Features:

* Create Warehouse
* Warehouse Transfer
* Warehouse Stock Tracking

---

## Purchasing

Features:

Purchase Order

Purchase Order Items

Receive Goods

Supplier Return

Purchase History

---

## CRM

Features:

Membership

Customer Points

Customer Tier

Transaction History

---

## Employee Management

Features:

Employee CRUD

Role Assignment

Branch Assignment

---

## Finance Lite

Features:

Income

Expense

Cashflow

No accounting journal required.

---

# OUT OF SCOPE

Do NOT build:

* Restaurant Features
* Kitchen Display
* Menu Builder
* Recipe Management
* Accounting Journal
* AI Assistant
* Marketplace Integration
* Mobile Application

These belong to future versions.

---

# SUCCESS CRITERIA

V1:

* POS Working
* Inventory Accurate
* Sales Reports Functional

V2:

* Multi Branch Functional
* Warehouse Functional
* Purchasing Functional

Only after V2 is complete may V3 planning begin.
