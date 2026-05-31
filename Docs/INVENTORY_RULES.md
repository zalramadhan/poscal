# INVENTORY_RULES.md

CRITICAL DOCUMENT

---

# GOLDEN RULE

Inventory accuracy is more important than UI.

---

# SOURCE OF TRUTH

inventory_movements

ONLY

---

# NEVER

Never update inventory directly.

Forbidden:

inventory.quantity = 100

---

# ALWAYS

Create inventory movement.

Recalculate balance.

---

# MOVEMENT TYPES

PURCHASE

SALE

ADJUSTMENT

TRANSFER_IN

TRANSFER_OUT

STOCK_OPNAME

RETURN

---

# SALE RULE

Sale completed

↓

Create SALE movement

↓

Decrease stock

---

# PURCHASE RULE

Receive purchase

↓

Create PURCHASE movement

↓

Increase stock

---

# TRANSFER RULE

Transfer creates:

TRANSFER_OUT

and

TRANSFER_IN

Two records mandatory.

---

# OPNAME RULE

Difference detected

↓

Adjustment Movement

↓

Inventory Updated

---

# AUDIT REQUIREMENT

Every movement must contain:

* User
* Product
* Warehouse
* Timestamp
* Reference Document
