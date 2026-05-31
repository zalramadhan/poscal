# API_CONTRACTS.md

Version: V1-V2

---

# CREATE PRODUCT

POST

/api/v1/products

Request

{
"name":"Coca Cola 330ml",
"sku":"CC330",
"barcode":"899999999",
"categoryId":"uuid",
"brandId":"uuid",
"unitId":"uuid",
"costPrice":5000,
"sellingPrice":7000
}

Response

{
"success":true,
"message":"Product created",
"data":{
"id":"uuid"
}
}

---

# CREATE SALE

POST

/api/v1/sales

Request

{
"customerId":"uuid",
"items":[
{
"productId":"uuid",
"quantity":2
}
],
"paymentMethod":"cash"
}

Response

{
"success":true,
"data":{
"id":"uuid",
"invoiceNumber":"INV-2026-0001"
}
}

---

# CREATE PURCHASE ORDER

POST

/api/v1/purchase-orders

Request

{
"supplierId":"uuid",
"warehouseId":"uuid",
"items":[
{
"productId":"uuid",
"quantity":100,
"costPrice":5000
}
]
}

Response

{
"success":true,
"data":{
"id":"uuid",
"status":"DRAFT"
}
}

---

# INVENTORY MOVEMENT

Response

{
"id":"uuid",
"productId":"uuid",
"type":"SALE",
"quantity":10,
"warehouseId":"uuid",
"createdAt":"timestamp"
}

---

# STANDARD ERROR

{
"success":false,
"message":"Validation failed",
"errors":{
"name":"Required"
}
}
