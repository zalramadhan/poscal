# Cashier Shift Management System - Design Spec

## Overview

Comprehensive cashier shift management with cash reconciliation and manager approval workflow.

**Target:** Track which cashier processed each sale, reconcile expected vs actual cash, require manager approval for variances.

---

## 1. Data Model

### New Prisma Model: `CashierShift`

```prisma
model CashierShift {
  id            String      @id @default(cuid())
  tenantId      String
  userId        String
  branchId      String
  status        ShiftStatus @default(OPEN)
  openingCash   Decimal     @db.Decimal(18, 2)
  closingCash   Decimal?    @db.Decimal(18, 2)
  expectedCash  Decimal?    @db.Decimal(18, 2)
  variance      Decimal?    @db.Decimal(18, 2)
  openedAt      DateTime    @default(now())
  closedAt      DateTime?
  closedBy      String?
  notes         String?

  tenant Tenant @relation(fields: [tenantId], references: [id])
  sales  Sale[]

  @@index([tenantId, userId])
  @@index([tenantId, status])
  @@index([branchId])
}
```

### New Enum: `ShiftStatus`

```prisma
enum ShiftStatus {
  OPEN
  PENDING_APPROVAL
  CLOSED
}
```

### Extend Sale Model

Add `cashierShiftId` field to link each sale to the shift that created it:

```prisma
model Sale {
  // ... existing fields ...
  cashierShiftId String?
  cashierShift   CashierShift? @relation(fields: [cashierShiftId], references: [id])
}
```

---

## 2. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/cashier/shifts/start` | Open a new shift |
| GET | `/api/v1/cashier/shifts` | List shifts (filter by status, user, date) |
| GET | `/api/v1/cashier/shifts/current` | Get current open shift for logged-in user |
| GET | `/api/v1/cashier/shifts/:id` | Get shift details with sales |
| POST | `/api/v1/cashier/shifts/:id/close` | Close shift (calculate variance) |
| POST | `/api/v1/cashier/shifts/:id/approve` | Manager approves and closes with variance |
| GET | `/api/v1/cashier/shifts/:id/report` | Get shift summary report |

### POST /api/v1/cashier/shifts/start

Request:
```json
{
  "branchId": "uuid",
  "openingCash": 500000
}
```

Response:
```json
{
  "id": "uuid",
  "status": "OPEN",
  "openingCash": 500000,
  "openedAt": "2026-06-01T08:00:00Z"
}
```

Validation:
- User cannot have another OPEN shift
- openingCash must be >= 0

### POST /api/v1/cashier/shifts/:id/close

Request:
```json
{
  "closingCash": 1500000,
  "notes": "Optional notes"
}
```

Workflow:
1. Calculate expectedCash = openingCash + sum(cash sales during shift)
2. Calculate variance = closingCash - expectedCash
3. If variance ≠ 0 → set status to PENDING_APPROVAL
4. If variance = 0 → set status to CLOSED immediately

Response:
```json
{
  "id": "uuid",
  "status": "CLOSED",
  "expectedCash": 1500000,
  "closingCash": 1500000,
  "variance": 0,
  "closedAt": "2026-06-01T16:00:00Z"
}
```

Or if variance exists:
```json
{
  "id": "uuid",
  "status": "PENDING_APPROVAL",
  "expectedCash": 1500000,
  "closingCash": 1450000,
  "variance": -50000,
  "message": "Variance requires manager approval"
}
```

### POST /api/v1/cashier/shifts/:id/approve

Request:
```json
{
  "managerId": "manager-uuid",
  "notes": "Cash was dropped during counting"
}
```

Workflow:
- Only allowed if status = PENDING_APPROVAL
- Sets status to CLOSED
- Records closedBy (manager) and notes

### GET /api/v1/cashier/shifts/:id/report

Response:
```json
{
  "shift": {
    "id": "uuid",
    "user": { "id": "uuid", "name": "John Doe" },
    "branch": { "id": "uuid", "name": "Main Store" },
    "status": "CLOSED",
    "openingCash": 500000,
    "closingCash": 1500000,
    "expectedCash": 1500000,
    "variance": 0,
    "openedAt": "2026-06-01T08:00:00Z",
    "closedAt": "2026-06-01T16:00:00Z"
  },
  "sales": {
    "totalCount": 45,
    "totalRevenue": 2500000,
    "byPaymentMethod": {
      "cash": { "count": 20, "total": 1000000 },
      "debit": { "count": 15, "total": 750000 },
      "qris": { "count": 10, "total": 750000 }
    },
    "refunds": { "count": 2, "total": 50000 }
  },
  "duration": "8 hours"
}
```

---

## 3. Service Layer

### New Service: `shift.service.ts`

```typescript
export const shiftService = {
  async startShift(params: {
    tenantId: string
    userId: string
    branchId: string
    openingCash: number
  }) {
    // Check no existing OPEN shift for user
    // Create new CashierShift with OPEN status
  },

  async closeShift(params: {
    shiftId: string
    tenantId: string
    closingCash: number
    notes?: string
  }) {
    // Get all sales during shift
    // Calculate expectedCash = openingCash + cashSales
    // Calculate variance
    // If variance = 0 → CLOSED
    // If variance ≠ 0 → PENDING_APPROVAL
  },

  async approveShift(params: {
    shiftId: string
    tenantId: string
    managerId: string
    notes?: string
  }) {
    // Only allowed from PENDING_APPROVAL
    // Set status to CLOSED, record closedBy
  },

  async getShiftReport(shiftId: string, tenantId: string) {
    // Return shift with sales breakdown
    // By payment method
    // Refund count
    // Duration
  }
}
```

---

## 4. POS Integration

### POS Page Changes

**Shift Check on Load:**
- On POS page mount, check `/api/v1/cashier/shifts/current`
- If no open shift → show "Start Shift" modal before allowing checkout

**Start Shift Modal:**
```
┌─────────────────────────────────────┐
│         Start Your Shift            │
├─────────────────────────────────────┤
│  Branch: Main Store                 │
│                                     │
│  Opening Cash Amount                │
│  [Rp 500,000________________]       │
│                                     │
│  [Cancel]        [Start Shift]      │
└─────────────────────────────────────┘
```

**POS Header (when shift open):**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]  │ Search products...  │ SHIFT: OPEN │ Rp 500,000 │ X │
│          │                     │ Sales: 45   │ +1,500,000 │   │
└──────────────────────────────────────────────────────────────┘
```

**Close Shift Button:**
- Opens modal to count closing cash
- Shows expected vs actual
- Submit to close or request approval

**Close Shift Modal:**
```
┌─────────────────────────────────────┐
│         Close Your Shift            │
├─────────────────────────────────────┤
│  Opening Cash:    Rp 500,000        │
│  Cash Sales:      Rp 1,000,000      │
│  ─────────────────────────────       │
│  Expected Cash:   Rp 1,500,000       │
│                                     │
│  Counted Cash:                    │
│  [Rp 1,500,000________________]     │
│                                     │
│  Variance: Rp 0                     │
│                                     │
│  [Cancel]        [Close Shift]      │
└─────────────────────────────────────┘
```

---

## 5. Manager Approval Flow

### When Variance Exists

```
┌─────────────────────────────────────┐
│         ⚠️ Cash Variance             │
├─────────────────────────────────────┤
│  Expected:  Rp 1,500,000            │
│  Actual:    Rp 1,450,000            │
│  Variance:  Rp -50,000              │
│                                     │
│  This requires manager approval     │
│  to close the shift.                │
│                                     │
│  Manager PIN:                       │
│  [______]                           │
│                                     │
│  Notes (optional):                  │
│  [__________________________]       │
│                                     │
│  [Cancel]    [Approve & Close]      │
└─────────────────────────────────────┘
```

---

## 6. Reports

### Shift List Page

New page: `/app/shifts/`

- List all shifts with status
- Filter by: date range, status, cashier, branch
- Click to view shift details

### Shift Detail Page

New page: `/app/shifts/[id]/`

- Full shift report
- List of all sales during shift
- Payment method breakdown
- Variance history

### Dashboard Widget

- Show today's shift summary
- Open shifts count
- Pending approval count (for managers)

---

## 7. Implementation Phases

### Phase 1: Core Shift Management
- Add Prisma models
- Create shift service
- Create shift API endpoints
- Basic POS shift check

### Phase 2: POS Integration
- Start shift modal
- Shift indicator in POS header
- Close shift flow
- Manager approval modal

### Phase 3: Reports
- Shift list page
- Shift detail page
- Dashboard widget

---

## Edge Cases

| Case | Handling |
|------|----------|
| POS crashes during shift | Shift remains OPEN; cashier can resume |
| User closes app without closing shift | Shift stays OPEN; admin can force-close |
| No sales during shift | expectedCash = openingCash; variance = closingCash - openingCash |
| Manager not available for approval | Shift stays PENDING_APPROVAL until manager approves |
| Negative variance (missing cash) | Treated same as positive; requires approval |
| Cash sale refund during shift | Reduces expectedCash (refund goes back to cash) |

---

## Dependencies

- User authentication (already exists)
- Payment method tracking (already exists in Sale)
- Branch/warehouse (already exists)
- Manager role check for approval

---

## Files to Create/Modify

### New Files
- `prisma/migrations/..._add_cashier_shift` - Migration
- `src/lib/services/shift.service.ts` - Shift business logic
- `src/app/api/v1/cashier/shifts/route.ts` - List, start
- `src/app/api/v1/cashier/shifts/[id]/route.ts` - Get, close, approve
- `src/app/api/v1/cashier/shifts/[id]/report/route.ts` - Report
- `src/app/app/shifts/page.tsx` - Shift list
- `src/app/app/shifts/[id]/page.tsx` - Shift detail

### Modified Files
- `prisma/schema.prisma` - Add CashierShift model, ShiftStatus enum, Sale.cashierShiftId
- `src/lib/services/sale.service.ts` - Link sale to active shift
- `src/app/app/pos/page.tsx` - Shift check, shift indicator, start/close modals
- `src/app/app/dashboard/page.tsx` - Add shift summary widget
