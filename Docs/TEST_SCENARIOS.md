# TEST_SCENARIOS.md

Version: V1-V2

---

# AUTH

Login Success

Login Failed

Forgot Password

Reset Password

Expired Token

Unauthorized Access

---

# PRODUCTS

Create Product

Edit Product

Delete Product

Duplicate SKU

Missing Name

Invalid Price

---

# INVENTORY

Stock In

Stock Out

Adjustment

Stock Opname

Movement History

---

# INVENTORY EDGE CASES

Negative Stock

Large Quantity

Concurrent Update

Duplicate Submission

---

# SALES

Create Sale

Cancel Sale

Refund Sale

Receipt Generation

---

# SALES EDGE CASES

Out Of Stock

Zero Quantity

Invalid Product

Duplicate Checkout

Network Retry

---

# PURCHASES

Create PO

Approve PO

Receive PO

Cancel PO

---

# PURCHASE EDGE CASES

Receive Twice

Receive After Cancel

Negative Quantity

Invalid Supplier

---

# STOCK TRANSFER

Create Transfer

Ship Transfer

Receive Transfer

---

# TRANSFER EDGE CASES

Same Warehouse

Transfer More Than Stock

Receive Twice

Cancel After Ship

---

# MULTI TENANT

Tenant A Product

Cannot Access Tenant B Product

Tenant A Sale

Cannot Access Tenant B Sale

Tenant A Customer

Cannot Access Tenant B Customer

---

# RBAC

Cashier Cannot Access Reports

Cashier Cannot Delete Product

Warehouse Staff Cannot Access Finance

Manager Can View Reports

Owner Full Access

---

# PERFORMANCE

100 Products

1000 Products

10000 Products

---

# SECURITY

SQL Injection

XSS

CSRF

Privilege Escalation

IDOR

---

# ACCEPTANCE

All scenarios must pass before release.

Minimum Pass Rate

95%

Blocking Bug Count

0
