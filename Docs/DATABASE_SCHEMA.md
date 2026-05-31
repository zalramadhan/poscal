# DATABASE_SCHEMA.md

Version: Prisma Planning

---

# GLOBAL RULES

Every table contains:

id

tenantId

createdAt

updatedAt

---

# TABLE ORDER

1. tenants

2. roles

3. branches

4. users

5. categories

6. brands

7. units

8. products

9. customers

10. suppliers

11. warehouses

12. inventoryBalances

13. inventoryMovements

14. sales

15. saleItems

16. purchaseOrders

17. purchaseOrderItems

18. stockTransfers

19. stockTransferItems

20. expenses

21. incomes

22. auditLogs

---

# INDEXES

products

tenantId

sku

barcode

---

customers

tenantId

phone

email

---

suppliers

tenantId

phone

---

sales

tenantId

invoiceNumber

createdAt

---

inventoryMovements

tenantId

warehouseId

productId

createdAt

---

auditLogs

tenantId

entity

createdAt

---

# CASCADE RULES

Tenant Delete

↓

Soft Delete Only

---

Product Delete

↓

Restricted if used

---

Customer Delete

↓

Soft Delete

---

Supplier Delete

↓

Soft Delete

---

# SOFT DELETE

Recommended:

deletedAt

for:

* products
* customers
* suppliers
* users
