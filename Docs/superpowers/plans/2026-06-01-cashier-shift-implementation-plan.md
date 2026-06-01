# Cashier Shift Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement cashier shift management with cash reconciliation, manager approval for variances, and POS integration.

**Architecture:** Cashier opens shift with opening cash, all sales during shift linked to shift, on close calculates expected vs actual cash, requires manager approval if variance exists.

**Tech Stack:** Next.js 15, Prisma 7, PostgreSQL, Zustand

---

## File Structure

### Phase 1: Core Shift Management
- Modify: `prisma/schema.prisma` - Add CashierShift model, ShiftStatus enum, Sale.cashierShiftId
- Create: `src/lib/services/shift.service.ts` - Shift business logic
- Create: `src/app/api/v1/cashier/shifts/route.ts` - List, start
- Create: `src/app/api/v1/cashier/shifts/[id]/route.ts` - Get, close, approve

### Phase 2: POS Integration
- Modify: `src/lib/services/sale.service.ts` - Link sale to active shift
- Modify: `src/app/app/pos/page.tsx` - Shift check, start/close modals

### Phase 3: Reports & UI
- Create: `src/app/app/shifts/page.tsx` - Shift list
- Create: `src/app/app/shifts/[id]/page.tsx` - Shift detail
- Modify: `src/app/app/dashboard/page.tsx` - Add shift summary widget

---

## Phase 1: Core Shift Management

### Task 1: Update Prisma Schema for Cashier Shift

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add ShiftStatus enum after KitchenOrderStatus (~line 82)**

```prisma
enum ShiftStatus {
  OPEN
  PENDING_APPROVAL
  CLOSED
}
```

- [ ] **Step 2: Add CashierShift model after Tenant model (~line 124)**

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
  openedAt     DateTime    @default(now())
  closedAt     DateTime?
  closedBy     String?
  notes        String?

  tenant Tenant @relation(fields: [tenantId], references: [id])
  sales  Sale[]

  @@index([tenantId, userId])
  @@index([tenantId, status])
  @@index([branchId])
}
```

- [ ] **Step 3: Add cashierShiftId to Sale model (~line 517)**

Add after `createdBy` field:
```prisma
  cashierShiftId String?
  cashierShift   CashierShift? @relation(fields: [cashierShiftId], references: [id])
```

- [ ] **Step 4: Run Prisma generate and push**

```bash
npm run db:generate && npm run db:push
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(cashier): add CashierShift model and ShiftStatus enum"
```

---

### Task 2: Create Shift Service

**Files:**
- Create: `src/lib/services/shift.service.ts`

- [ ] **Step 1: Create shift service**

```typescript
import { prisma } from '@/lib/prisma'
import { NotFoundError, ConflictError } from '@/lib/errors'

export const shiftService = {
  async startShift(params: {
    tenantId: string
    userId: string
    branchId: string
    openingCash: number
  }) {
    const { tenantId, userId, branchId, openingCash } = params

    const existingShift = await prisma.cashierShift.findFirst({
      where: { tenantId, userId, status: 'OPEN' },
    })

    if (existingShift) {
      throw new ConflictError('You already have an open shift')
    }

    const shift = await prisma.cashierShift.create({
      data: {
        tenantId,
        userId,
        branchId,
        openingCash,
        status: 'OPEN',
      },
      include: {
        tenant: { select: { name: true } },
      },
    })

    return shift
  },

  async getCurrentShift(tenantId: string, userId: string) {
    const shift = await prisma.cashierShift.findFirst({
      where: { tenantId, userId, status: 'OPEN' },
      include: {
        user: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
        _count: { select: { sales: true } },
      },
    })
    return shift
  },

  async getShiftById(shiftId: string, tenantId: string) {
    const shift = await prisma.cashierShift.findFirst({
      where: { id: shiftId, tenantId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } },
        sales: {
          include: {
            payments: {
              include: { paymentMethod: true },
            },
            items: { include: { product: true } },
          },
        },
      },
    })
    if (!shift) throw new NotFoundError('Cashier shift')
    return shift
  },

  async listShifts(params: {
    tenantId: string
    page?: number
    limit?: number
    status?: 'OPEN' | 'PENDING_APPROVAL' | 'CLOSED'
    userId?: string
    branchId?: string
    startDate?: string
    endDate?: string
  }) {
    const { tenantId, page = 1, limit = 20, status, userId, branchId, startDate, endDate } = params

    const where: any = { tenantId }
    if (status) where.status = status
    if (userId) where.userId = userId
    if (branchId) where.branchId = branchId
    if (startDate || endDate) {
      where.openedAt = {}
      if (startDate) where.openedAt.gte = new Date(startDate)
      if (endDate) where.openedAt.lte = new Date(endDate)
    }

    const [shifts, total] = await Promise.all([
      prisma.cashierShift.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          _count: { select: { sales: true } },
        },
        orderBy: { openedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashierShift.count({ where }),
    ])

    return {
      data: shifts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  },

  async closeShift(params: {
    shiftId: string
    tenantId: string
    closingCash: number
    notes?: string
  }) {
    const { shiftId, tenantId, closingCash, notes } = params

    const shift = await prisma.cashierShift.findFirst({
      where: { id: shiftId, tenantId, status: 'OPEN' },
      include: {
        sales: {
          where: { status: 'COMPLETED' },
          include: {
            payments: { include: { paymentMethod: true } },
          },
        },
      },
    })

    if (!shift) throw new NotFoundError('Open shift not found')

    const cashSales = shift.sales
      .filter((sale) => sale.payments.some((p) => p.paymentMethod.name.toLowerCase().includes('cash')))
      .reduce((sum, sale) => sum + sale.total.toNumber(), 0)

    const refundCash = shift.sales
      .filter((sale) => sale.status === 'REFUNDED')
      .reduce((sum, sale) => sum + sale.total.toNumber(), 0)

    const expectedCash = shift.openingCash.toNumber() + cashSales - refundCash
    const variance = closingCash - expectedCash

    const updateData: any = {
      closingCash,
      expectedCash,
      variance,
      notes,
    }

    if (variance === 0) {
      updateData.status = 'CLOSED'
      updateData.closedAt = new Date()
    } else {
      updateData.status = 'PENDING_APPROVAL'
    }

    const updated = await prisma.cashierShift.update({
      where: { id: shiftId },
      data: updateData,
    })

    return updated
  },

  async approveShift(params: {
    shiftId: string
    tenantId: string
    managerId: string
    notes?: string
  }) {
    const { shiftId, tenantId, managerId, notes } = params

    const shift = await prisma.cashierShift.findFirst({
      where: { id: shiftId, tenantId, status: 'PENDING_APPROVAL' },
    })

    if (!shift) throw new NotFoundError('Shift pending approval not found')

    const updated = await prisma.cashierShift.update({
      where: { id: shiftId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: managerId,
        notes: notes || shift.notes,
      },
    })

    return updated
  },

  async getShiftReport(shiftId: string, tenantId: string) {
    const shift = await this.getShiftById(shiftId, tenantId)

    const completedSales = shift.sales.filter((s) => s.status === 'COMPLETED')
    const refundedSales = shift.sales.filter((s) => s.status === 'REFUNDED')

    const byPaymentMethod: Record<string, { count: number; total: number }> = {}
    for (const sale of completedSales) {
      for (const payment of sale.payments) {
        const methodName = payment.paymentMethod.name.toLowerCase()
        if (!byPaymentMethod[methodName]) {
          byPaymentMethod[methodName] = { count: 0, total: 0 }
        }
        byPaymentMethod[methodName].count++
        byPaymentMethod[methodName].total += payment.amount.toNumber()
      }
    }

    const totalRevenue = completedSales.reduce((sum, s) => sum + s.total.toNumber(), 0)
    const totalRefunds = refundedSales.reduce((sum, s) => sum + s.total.toNumber(), 0)

    const durationMs = shift.closedAt
      ? new Date(shift.closedAt).getTime() - new Date(shift.openedAt).getTime()
      : Date.now() - new Date(shift.openedAt).getTime()
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    const duration = `${durationHours}h ${durationMinutes}m`

    return {
      shift: {
        id: shift.id,
        user: shift.user,
        branch: shift.branch,
        status: shift.status,
        openingCash: shift.openingCash.toNumber(),
        closingCash: shift.closingCash?.toNumber(),
        expectedCash: shift.expectedCash?.toNumber(),
        variance: shift.variance?.toNumber(),
        openedAt: shift.openedAt,
        closedAt: shift.closedAt,
      },
      sales: {
        totalCount: completedSales.length,
        totalRevenue,
        byPaymentMethod,
        refunds: { count: refundedSales.length, total: totalRefunds },
      },
      duration,
    }
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/shift.service.ts
git commit -m "feat(cashier): add shift service with start/close/approve logic"
```

---

### Task 3: Create Shift API Routes

**Files:**
- Create: `src/app/api/v1/cashier/shifts/route.ts`
- Create: `src/app/api/v1/cashier/shifts/[id]/route.ts`

- [ ] **Step 1: Create shifts route (list and start)**

```typescript
import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { shiftService } from '@/lib/services/shift.service'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id')
  const params = await parseSearchParams(request)

  const url = new URL(request.url)
  const current = url.searchParams.get('current')

  if (current && userId) {
    const shift = await shiftService.getCurrentShift(tenantId, userId)
    return successResponse(shift)
  }

  const result = await shiftService.listShifts({
    tenantId,
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    status: params.status as any,
    userId: params.userId as string,
    branchId: params.branchId as string,
    startDate: params.startDate as string,
    endDate: params.endDate as string,
  })

  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const { branchId, openingCash } = body

  if (!branchId || openingCash === undefined) {
    return errorResponse('branchId and openingCash are required', 400)
  }

  const shift = await shiftService.startShift({
    tenantId,
    userId,
    branchId,
    openingCash: Number(openingCash),
  })

  return successResponse(shift, 'Shift started successfully', 201)
})
```

- [ ] **Step 2: Create shift [id] route (get, close, approve)**

```typescript
import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { shiftService } from '@/lib/services/shift.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)

  const shift = await shiftService.getShiftById(id, tenantId)
  return successResponse(shift)
})

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'close') {
    const { closingCash, notes } = body
    const shift = await shiftService.closeShift({
      shiftId: id,
      tenantId,
      closingCash: Number(closingCash),
      notes,
    })
    const message = shift.status === 'PENDING_APPROVAL'
      ? 'Variance detected, manager approval required'
      : 'Shift closed successfully'
    return successResponse(shift, message)
  }

  if (action === 'approve') {
    const { managerId, notes } = body
    const shift = await shiftService.approveShift({
      shiftId: id,
      tenantId,
      managerId: managerId || userId,
      notes,
    })
    return successResponse(shift, 'Shift approved and closed')
  }

  return errorResponse('Invalid action. Use ?action=close|approve', 400)
})
```

- [ ] **Step 3: Create shift report route**

Create: `src/app/api/v1/cashier/shifts/[id]/report/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { shiftService } from '@/lib/services/shift.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)

  const report = await shiftService.getShiftReport(id, tenantId)
  return successResponse(report)
})
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/v1/cashier/shifts/route.ts src/app/api/v1/cashier/shifts/[id]/route.ts src/app/api/v1/cashier/shifts/[id]/report/route.ts
git commit -m "feat(api): add cashier shift endpoints"
```

---

## Phase 2: POS Integration

### Task 4: Update Sale Service to Link Sale to Shift

**Files:**
- Modify: `src/lib/services/sale.service.ts`

- [ ] **Step 1: Update create method to link sale to active shift**

Read the current sale.service.ts. Find the create method. Add cashierShiftId parameter and link the sale to the current open shift:

Add to the create params:
```typescript
cashierShiftId?: string
```

In the create method, after creating the Sale record, add the cashierShiftId link:
```typescript
const sale = await prisma.sale.create({
  data: {
    // ... existing fields ...
    cashierShiftId, // Add this line
  },
  // ...
})
```

- [ ] **Step 2: Update POS route to fetch current shift and pass cashierShiftId**

Read `src/app/api/v1/sales/route.ts`. When creating a sale:
1. Get current shift via header or query
2. Pass cashierShiftId to saleService.create

- [ ] **Step 3: Commit**

```bash
git add src/lib/services/sale.service.ts src/app/api/v1/sales/route.ts
git commit -m "feat(sales): link sales to cashier shift"
```

---

### Task 5: Update POS Page for Shift Integration

**Files:**
- Modify: `src/app/app/pos/page.tsx`

- [ ] **Step 1: Add shift state and current shift check**

Add to the component state:
```typescript
const [currentShift, setCurrentShift] = useState<any>(null)
const [showStartShift, setShowStartShift] = useState(false)
const [showCloseShift, setShowCloseShift] = useState(false)
const [openingCash, setOpeningCash] = useState('')
const [closingCash, setClosingCash] = useState('')
```

Add useEffect to check current shift on mount:
```typescript
useEffect(() => {
  const checkShift = async () => {
    const res = await fetch('/api/v1/cashier/shifts?current=true', {
      headers: { 'x-user-id': userId }
    })
    const data = await res.json()
    if (data.data) {
      setCurrentShift(data.data)
    } else {
      setShowStartShift(true)
    }
  }
  checkShift()
}, [])
```

- [ ] **Step 2: Add Start Shift Modal**

Add before the main return statement:
```typescript
const StartShiftModal = () => (
  <Dialog open={showStartShift} onOpenChange={setShowStartShift}>
    <DialogContent>
      <DialogHeader>Start Your Shift</DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label>Opening Cash Amount</label>
          <Input
            type="number"
            placeholder="500000"
            value={openingCash}
            onChange={(e) => setOpeningCash(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowStartShift(false)}>Cancel</Button>
        <Button onClick={handleStartShift}>Start Shift</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
```

- [ ] **Step 3: Add Close Shift Modal**

```typescript
const CloseShiftModal = () => (
  <Dialog open={showCloseShift} onOpenChange={setShowCloseShift}>
    <DialogContent>
      <DialogHeader>Close Your Shift</DialogHeader>
      <div className="space-y-4 py-4">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Opening Cash:</span>
            <span>Rp {currentShift?.openingCash?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Expected Cash:</span>
            <span>Rp {((currentShift?.expectedCash) || currentShift?.openingCash)?.toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <label>Counted Cash</label>
          <Input
            type="number"
            placeholder="1500000"
            value={closingCash}
            onChange={(e) => setClosingCash(e.target.value)}
          />
        </div>
        {closingCash && (
          <div className="text-sm">
            Variance: Rp {(Number(closingCash) - (currentShift?.expectedCash || currentShift?.openingCash)).toLocaleString()}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowCloseShift(false)}>Cancel</Button>
        <Button onClick={handleCloseShift}>Close Shift</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
```

- [ ] **Step 4: Add shift handlers**

```typescript
const handleStartShift = async () => {
  const res = await fetch('/api/v1/cashier/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({ branchId: warehouseId, openingCash: Number(openingCash) }),
  })
  const data = await res.json()
  if (res.ok) {
    setCurrentShift(data.data)
    setShowStartShift(false)
    setOpeningCash('')
  }
}

const handleCloseShift = async () => {
  const res = await fetch(`/api/v1/cashier/shifts/${currentShift.id}?action=close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({ closingCash: Number(closingCash) }),
  })
  const data = await res.json()
  if (res.ok) {
    if (data.data.status === 'PENDING_APPROVAL') {
      alert('Variance requires manager approval')
    }
    setCurrentShift(null)
    setShowCloseShift(false)
    setClosingCash('')
  }
}
```

- [ ] **Step 5: Add shift indicator to POS header**

Add shift status display next to warehouse selector or in header area:
```typescript
{currentShift && (
  <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded">
    <span className="text-sm font-medium">SHIFT: {currentShift.status}</span>
    <Button size="sm" variant="ghost" onClick={() => setShowCloseShift(true)}>Close</Button>
  </div>
)}
```

- [ ] **Step 6: Add modals to render in return**

Add before the closing </div> of main component:
```typescript
{showStartShift && <StartShiftModal />}
{showCloseShift && <CloseShiftModal />}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/app/pos/page.tsx
git commit -m "feat(pos): add shift management integration"
```

---

## Phase 3: Reports & UI

### Task 6: Create Shift List Page

**Files:**
- Create: `src/app/app/shifts/page.tsx`

- [ ] **Step 1: Create shift list page**

Create a page similar to other list pages (e.g., employees) with:
- Data table showing shifts
- Columns: Date, Cashier, Branch, Status, Opening Cash, Closing Cash, Variance
- Status badges (OPEN=green, PENDING_APPROVAL=yellow, CLOSED=gray)
- Filter by status, date range
- Click row to navigate to detail

- [ ] **Step 2: Commit**

```bash
git add src/app/app/shifts/page.tsx
git commit -m "feat(shifts): add shift list page"
```

---

### Task 7: Create Shift Detail Page

**Files:**
- Create: `src/app/app/shifts/[id]/page.tsx`

- [ ] **Step 1: Create shift detail page**

Create a page showing:
- Shift summary (cashier, branch, times, cash amounts)
- Sales during shift
- Payment method breakdown
- Variance info if any
- Approve button for PENDING_APPROVAL shifts (manager only)

- [ ] **Step 2: Commit**

```bash
git add src/app/app/shifts/[id]/page.tsx
git commit -m "feat(shifts): add shift detail page"
```

---

### Task 8: Add Shift Widget to Dashboard

**Files:**
- Modify: `src/app/app/dashboard/page.tsx`

- [ ] **Step 1: Add shift summary to dashboard**

Add to the dashboard:
- Open shifts count
- Pending approval shifts count
- Today's total cash sales

Fetch from `/api/v1/cashier/shifts?status=OPEN` and `/api/v1/cashier/shifts?status=PENDING_APPROVAL`

- [ ] **Step 2: Commit**

```bash
git add src/app/app/dashboard/page.tsx
git commit -m "feat(dashboard): add shift summary widget"
```

---

## Spec Coverage Checklist

- [x] CashierShift model with status enum
- [x] Sale linked to shift via cashierShiftId
- [x] Start shift API
- [x] Close shift with variance calculation
- [x] Approve shift for variances
- [x] Shift report with sales breakdown
- [x] POS shift check on load
- [x] Start shift modal
- [x] Close shift modal
- [x] Shift list page
- [x] Shift detail page
- [x] Dashboard shift widget

## Dependencies

- Prisma 7 with PostgreSQL
- Existing auth/user system
- Existing payment method tracking
- Existing branch system

## Estimated Tasks

Total: 8 tasks
Phase 1 (Core): 3 tasks
Phase 2 (POS): 2 tasks
Phase 3 (UI): 3 tasks

---

## Plan Complete

**Next: Choose execution approach**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
