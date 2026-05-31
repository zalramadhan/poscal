# STATE_MACHINE.md

Version: V1-V2

Status: Mandatory

---

# SALES

DRAFT

↓

COMPLETED

↓

REFUNDED

---

Allowed Transitions

DRAFT → COMPLETED

COMPLETED → REFUNDED

---

Forbidden

REFUNDED → COMPLETED

REFUNDED → DRAFT

---

Effects

COMPLETED

* Create inventory movement
* Reduce stock
* Create audit log

REFUNDED

* Create return movement
* Restore stock
* Create audit log

---

# PURCHASE ORDER

DRAFT

↓

APPROVED

↓

ORDERED

↓

RECEIVED

↓

COMPLETED

---

Alternative

DRAFT

↓

CANCELLED

---

APPROVED

↓

CANCELLED

---

Forbidden

RECEIVED → DRAFT

COMPLETED → ORDERED

---

Effects

RECEIVED

* Increase stock
* Create inventory movement

---

# STOCK TRANSFER

DRAFT

↓

IN_TRANSIT

↓

RECEIVED

---

Alternative

DRAFT

↓

CANCELLED

---

Effects

IN_TRANSIT

* Create TRANSFER_OUT

RECEIVED

* Create TRANSFER_IN

---

# STOCK OPNAME

DRAFT

↓

COMPLETED

---

Effects

COMPLETED

* Create adjustment movements
* Update balances

---

# USER

INVITED

↓

ACTIVE

↓

SUSPENDED

↓

ACTIVE

---

Alternative

ACTIVE

↓

DELETED

---

Deleted users cannot login.
