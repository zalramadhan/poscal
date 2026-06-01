# Inventory Accuracy System - Design Spec

## Overview

Comprehensive inventory accuracy system to prevent overselling, track unexplained stock loss, streamline stock opname, and alert on low stock levels.

**Target:** Real-time inventory management with stock reservation at POS

---

## 1. Stock Reservation System

### Problem
- POS deducts stock only on payment, causing overselling during high concurrency
- No visibility of "pending" stock in carts

### Solution
Implement stock reservation during POS checkout. Stock is held when added to cart, preventing overselling, and only deducted on payment completion.

### Data Model

**New Prisma Model: `StockReservation`**
```prisma
model StockReservation {
  id          String            @id @default(cuid())
  tenantId    String
  warehouseId String
  productId   String
  quantity    Int
  cartId      String            // Links to POS session/sale
  userId      String?
  expiresAt   DateTime
  status      ReservationStatus @default(ACTIVE)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([tenantId, warehouseId, productId, status])
  @@index([tenantId, cartId])
  @@index([expiresAt])
}

enum ReservationStatus {
  ACTIVE
  RELEASED    // Cancelled/timeout
  CONVERTED   // Paid and converted to sale
}
```

**Modify InventoryBalance:**
```prisma
model InventoryBalance {
  // ... existing fields ...
  reserved    Int @default(0)  // NEW: Quantity reserved for active carts

  @@index([tenantId, warehouseId, productId])
}
```

**Add computed available:**
```
available = quantity - reserved
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/inventory/reserve` | Reserve stock for cart items |
| POST | `/api/v1/inventory/release` | Release reservation (cancel/timeout) |
| POST | `/api/v1/inventory/confirm` | Confirm reservation → deduct stock on payment |

**POST /api/v1/inventory/reserve**
```json
{
  "warehouseId": "uuid",
  "cartId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 2 }
  ]
}
```
- Validates each product has sufficient `available = quantity - reserved`
- Creates StockReservation with `expiresAt = now() + 15 minutes`
- Returns success or partial failure with unavailable items

**POST /api/v1/inventory/release**
```json
{
  "cartId": "uuid"
}
```
- Sets all ACTIVE reservations for cartId to RELEASED
- Runs immediately on POS cart cancellation

**POST /api/v1/inventory/confirm**
```json
{
  "cartId": "uuid",
  "saleId": "uuid"
}
```
- Converts reservations to sale items
- Atomically within database transaction (with row-level locking):
  1. Create InventoryMovement (type: SALE) for each item
  2. Deduct from InventoryBalance.quantity
  3. Deduct from InventoryBalance.reserved (release the held stock)
  4. Set reservation status to CONVERTED
- Uses database transaction with row-level locking

### Reservation Cleanup Job

Background job runs every 5 minutes:
```sql
UPDATE StockReservation
SET status = 'RELEASED'
WHERE status = 'ACTIVE' AND expiresAt < NOW()
```

Update `InventoryBalance.reserved` for released reservations.

### POS Integration

**Cart Store (`src/stores/cart-store.ts`):**
- On `addToCart`: call `/api/v1/inventory/reserve`
- On `removeFromCart`: call `/api/v1/inventory/release`
- On `clearCart`: call `/api/v1/inventory/release`
- On `checkout`: call `/api/v1/inventory/confirm` then `/api/v1/sales`

**Cart display changes:**
- Show "Reserved" badge on items
- Show "X available" warning when adding more than available
- Cart timeout countdown timer

---

## 2. Movement Reason Codes

### Problem
Stock disappears with no explanation (wastage, breakage, theft not tracked)

### Solution
Require reason code for all stock-out operations. Track shrinkage separately.

### Schema Changes

**Extend InventoryMovementType enum:**
```prisma
enum InventoryMovementType {
  PURCHASE
  SALE
  RETURN
  ADJUSTMENT
  TRANSFER_IN
  TRANSFER_OUT
  STOCK_OPNAME
  WASTAGE      // NEW: Spoiled/expired
  BREAKAGE     // NEW: Damaged goods
  THEFT        // NEW: Suspected theft
  SHRINKAGE    // NEW: Uncategorized loss
}
```

**Add required reason to InventoryMovement:**
```prisma
model InventoryMovement {
  // ... existing fields ...
  reason    String?   // NEW: Required for STOCK_OUT, WASTAGE, BREAKAGE, THEFT, SHRINKAGE
  note      String?   // NEW: Optional explanation
}
```

### API Changes

**POST /api/v1/inventory (stock-out):**
```json
{
  "action": "stock-out",
  "warehouseId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 5,
      "reason": "BREAKAGE",
      "note": "Cracked during warehouse transfer"
    }
  ]
}
```

**Validation:** For ADJUSTMENT movements (negative quantity), each item MUST have:
- `reason` (enum value: WASTAGE, BREAKAGE, THEFT, SHRINKAGE, or ADJUSTMENT)
- `note` (optional explanation)

### Shrinkage Report

**New endpoint: GET /api/v1/reports/inventory?type=shrinkage**

Shows all inventory movements with reason = WASTAGE, BREAKAGE, THEFT, or SHRINKAGE within date range.

```json
{
  "data": [
    {
      "date": "2026-01-15",
      "product": "Widget A",
      "warehouse": "Main Warehouse",
      "quantity": 5,
      "reason": "BREAKAGE",
      "note": "Cracked during transfer",
      "recordedBy": "John Doe"
    }
  ],
  "summary": {
    "totalWastage": 10,
    "totalBreakage": 25,
    "totalTheft": 3,
    "totalShrinkage": 12,
    "totalLoss": 50,
    "lossPercentage": 1.2
  }
}
```

---

## 3. Stock Opname Workflow

### Problem
Physical counting vs system counts differ wildly, hard to reconcile, no audit trail

### Solution
Structured stock opname workflow with counting, variance calculation, and manager approval.

### Data Model

**Existing models (no changes needed):**
```prisma
StockOpname {
  id          String
  tenantId    String
  warehouseId String
  status      StockOpnameStatus
  notes       String?
  approvedBy  String?
  approvedAt  DateTime?
  createdBy   String
  createdAt   DateTime
  // Items stored separately
}

StockOpnameItem {
  id            String
  stockOpnameId String
  productId     String
  systemQty     Int      // What system thinks
  countedQty    Int?     // What staff counted (null = not counted yet)
  variance      Int?     // countedQty - systemQty
}
```

**Add approval fields if needed:**
```prisma
model StockOpname {
  // ... existing fields ...
  approvedBy  String?   // User ID who approved
  approvedAt  DateTime?
  rejectedBy  String?
  rejectedAt  DateTime?
  rejectNote  String?
}
```

### Workflow

```
┌─────────────┐
│  DRAFT      │  Staff creates opname, system populates expected counts
└──────┬──────┘
       │ submit
       ▼
┌─────────────┐
│  COUNTING   │  Staff counts physical stock, enters countedQty
└──────┬──────┘
       │ submit_counts
       ▼
┌─────────────┐
│  PENDING    │  System calculates variances
└──────┬──────┘
       │ manager reviews
       ▼
┌─────────────┐
│  APPROVED   │  Adjustment movements created, inventory updated
│  or REJECTED│  If rejected, back to COUNTING with notes
└─────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/inventory/opname/start` | Create opname, populate expected counts |
| GET | `/api/v1/inventory/opname/:id` | Get opname with all items and variances |
| POST | `/api/v1/inventory/opname/:id/counts` | Submit counted quantities |
| POST | `/api/v1/inventory/opname/:id/approve` | Manager approves → create adjustments |
| POST | `/api/v1/inventory/opname/:id/reject` | Manager rejects with reason |

**POST /api/v1/inventory/opname/start**
```json
{
  "warehouseId": "uuid",
  "notes": "Monthly stocktake"
}
```
- Creates StockOpname in DRAFT
- Creates StockOpnameItem for every product with inventory in that warehouse
- Returns opname ID

**POST /api/v1/inventory/opname/:id/counts**
```json
{
  "items": [
    { "productId": "uuid", "countedQty": 48 },
    { "productId": "uuid", "countedQty": 100 }
  ]
}
```
- Updates countedQty on specified items
- Calculates variance automatically

**POST /api/v1/inventory/opname/:id/approve**
```json
{
  "userId": "manager-uuid"
}
```
- Validates user has manager role or permission
- For each item with variance ≠ 0:
  - Creates InventoryMovement (type: STOCK_OPNAME)
  - Updates InventoryBalance
- Sets status to APPROVED
- Records approvedBy and approvedAt

**POST /api/v1/inventory/opname/:id/reject**
```json
{
  "userId": "manager-uuid",
  "reason": "Count was done incorrectly, please recount"
}
```
- Resets status to COUNTING
- Clears countedQty for recount
- Stores reject note

### UI Changes

**New page: `/app/inventory/opname/`**
- List of opname sessions with status
- Start new opname wizard
- Count entry grid (product | system qty | enter count | variance)
- Variance summary panel
- Approve/reject buttons (manager only)

---

## 4. Low Stock Alerts

### Problem
No proactive notification when stock runs low, especially across multiple warehouses

### Solution
Real-time low stock detection and dashboard alerts

### Implementation

**Dashboard already has low stock logic:**
```typescript
// In dashboard.service.ts - getLowStockItems()
WHERE "quantity" <= "minStock"
```

**Enhancements needed:**

1. **Expose as separate endpoint:**
   - GET `/api/v1/reports/inventory/low-stock` - All items below minStock
   - Response includes: product info, warehouse, current qty, minStock, suggested reorder

2. **Dashboard widget improvements:**
   - Show count of critical items
   - Group by urgency (critical = 0, warning = < 50% of min)
   - Link to reorder report

3. **Product list filtering:**
   - Filter products by stock level
   - Sort by lowest stock first

4. **Optional: Email alerts (future)**
   - Daily/weekly low stock digest
   - Critical item immediate notification

---

## 5. Real-Time Stock Display at POS

### Problem
POS shows product stock but doesn't account for pending reservations

### Solution
Update POS product list to show `available = balance - reserved`

### API Changes

**GET /api/v1/products (POS mode)**
```json
{
  "warehouseId": "uuid",
  "includeStock": true
}
```
Returns:
```json
{
  "id": "uuid",
  "name": "Product A",
  "sku": "SKU001",
  "price": 50000,
  "stock": {
    "balance": 100,
    "reserved": 5,
    "available": 95
  }
}
```

### UI Changes

**POS Product Grid:**
- Show "95 available" instead of just stock count
- Gray out products with available = 0
- Show "Only X left" warning when available < minStock
- Real-time refresh on reservation/release

---

## Implementation Order

1. **Phase 1: Stock Reservation**
   - Add StockReservation model
   - Add reserve/release/confirm endpoints
   - Update cart store
   - Update product API to show available stock
   - Add reservation cleanup job

2. **Phase 2: Reason Codes**
   - Extend enum
   - Update inventory movement API
   - Add shrinkage report

3. **Phase 3: Stock Opname**
   - Add opname endpoints
   - Create opname UI page
   - Add manager approval flow

4. **Phase 4: Low Stock & POS Updates**
   - Separate low-stock endpoint
   - Dashboard widget improvements
   - POS real-time stock display

---

## Dependencies

- Database transaction support (Prisma supports this)
- Background job runner for reservation cleanup (can use setInterval or cron)
- Role/permission check for manager approval (already have roles system)

---

## Edge Cases

| Case | Handling |
|------|----------|
| Reservation expires during payment | Payment fails gracefully, show "stock no longer available" |
| Multiple carts reserve same stock | Second cart gets "insufficient stock" error |
| Network failure during reserve | Retry with exponential backoff, show error after 3 attempts |
| Stock opname counts more than system | Positive variance creates STOCK_OPNAME movement (+qty) |
| Manager approves partial variances | Not allowed - must approve/reject all or none |
