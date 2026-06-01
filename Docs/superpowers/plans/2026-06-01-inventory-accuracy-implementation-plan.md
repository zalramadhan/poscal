# Inventory Accuracy System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement comprehensive inventory accuracy system with stock reservation, reason codes, stock opname workflow, and low stock alerts.

**Architecture:** Four-phase implementation: (1) Stock Reservation with POS integration, (2) Movement Reason Codes + Shrinkage Report, (3) Stock Opname Workflow with Manager Approval, (4) Low Stock Alerts + POS Real-Time Stock Display

**Tech Stack:** Next.js 15 App Router, Prisma 7, PostgreSQL, Zustand

---

## File Structure

### Phase 1: Stock Reservation
- Modify: `prisma/schema.prisma` - Add StockReservation model, ReservationStatus enum, reserved field
- Create: `src/app/api/v1/inventory/reservation/route.ts` - Reserve/release/confirm endpoints
- Modify: `src/lib/services/inventory.service.ts` - Add reservation methods
- Modify: `src/validators/inventory.ts` - Add reserve/release/confirm schemas
- Modify: `src/stores/cart-store.ts` - POS integration with reservation
- Create: `src/lib/services/reservation.service.ts` - Reservation business logic
- Create: `src/app/api/cron/reservation-cleanup/route.ts` - Cleanup expired reservations

### Phase 2: Reason Codes
- Modify: `prisma/schema.prisma` - Extend InventoryMovementType enum, add reason/note fields
- Modify: `src/validators/inventory.ts` - Add reason validation for stock-out
- Modify: `src/lib/services/inventory.service.ts` - Require reason for ADJUSTMENT
- Modify: `src/app/api/v1/inventory/route.ts` - Require reason for stock-out
- Create: `src/app/api/v1/reports/inventory/route.ts` - Add shrinkage report

### Phase 3: Stock Opname
- Modify: `prisma/schema.prisma` - Add rejectedBy/rejectedAt/rejectNote to StockOpname
- Create: `src/app/api/v1/inventory/opname/route.ts` - Start opname
- Create: `src/app/api/v1/inventory/opname/[id]/route.ts` - Get opname, submit counts, approve/reject
- Create: `src/lib/services/opname.service.ts` - Opname business logic
- Create: `src/validators/opname.ts` - Opname validation schemas
- Create: `src/app/app/inventory/opname/page.tsx` - Stock opname UI page

### Phase 4: Low Stock & POS Updates
- Create: `src/app/api/v1/reports/inventory/low-stock/route.ts` - Low stock endpoint
- Modify: `src/app/api/v1/products/route.ts` - Add includeStock mode with available qty
- Modify: `src/app/app/pos/page.tsx` - Show available stock, disable when 0
- Modify: `src/app/app/dashboard/page.tsx` - Improve low stock widget

---

## Phase 1: Stock Reservation

### Task 1: Update Prisma Schema for Stock Reservation

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add ReservationStatus enum after KitchenOrderStatus enum (~line 82)**

```prisma
enum ReservationStatus {
  ACTIVE
  RELEASED
  CONVERTED
}
```

- [ ] **Step 2: Add StockReservation model after KitchenOrderItem model (~line 862)**

```prisma
model StockReservation {
  id          String            @id @default(cuid())
  tenantId    String
  warehouseId String
  productId   String
  quantity    Int
  cartId      String
  userId      String?
  expiresAt   DateTime
  status      ReservationStatus @default(ACTIVE)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([tenantId, warehouseId, productId, status])
  @@index([tenantId, cartId])
  @@index([expiresAt])
}
```

- [ ] **Step 3: Add reserved field to InventoryBalance model (~line 402)**

Add after `quantity` field:
```prisma
  reserved    Int               @default(0)
```

- [ ] **Step 4: Add WASTAGE, BREAKAGE, THEFT, SHRINKAGE to InventoryMovementType enum (~line 58)**

```prisma
enum InventoryMovementType {
  PURCHASE
  SALE
  RETURN
  ADJUSTMENT
  TRANSFER_IN
  TRANSFER_OUT
  STOCK_OPNAME
  WASTAGE
  BREAKAGE
  THEFT
  SHRINKAGE
}
```

- [ ] **Step 5: Add reason and note fields to InventoryMovement model (~line 429)**

Add after `notes` field:
```prisma
  reason      String?
  note        String?
```

- [ ] **Step 6: Run Prisma generate and push**

```bash
npm run db:generate && npm run db:push
```

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(inventory): add stock reservation model and reservation status enum"
```

---

### Task 2: Create Reservation Service

**Files:**
- Create: `src/lib/services/reservation.service.ts`

- [ ] **Step 1: Create reservation service with reserve, release, confirm methods**

```typescript
import { prisma } from '@/lib/prisma'
import { InsufficientStockError } from '@/lib/errors'

const RESERVATION_TIMEOUT_MINUTES = 15

export const reservationService = {
  async reserve(params: {
    tenantId: string
    warehouseId: string
    cartId: string
    userId?: string
    items: Array<{ productId: string; quantity: number }>
  }) {
    const { tenantId, warehouseId, cartId, userId, items } = params
    const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT_MINUTES * 60 * 1000)

    const results = []
    const errors = []

    for (const item of items) {
      const balance = await prisma.inventoryBalance.findUnique({
        where: { warehouseId_productId: { warehouseId, productId: item.productId } },
      })

      const currentQty = balance?.quantity.toNumber() ?? 0
      const reserved = balance?.reserved ?? 0
      const available = currentQty - reserved

      if (available < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        errors.push({
          productId: item.productId,
          productName: product?.name,
          requested: item.quantity,
          available,
        })
        continue
      }

      const reservation = await prisma.stockReservation.create({
        data: {
          tenantId,
          warehouseId,
          productId: item.productId,
          quantity: item.quantity,
          cartId,
          userId,
          expiresAt,
          status: 'ACTIVE',
        },
      })

      await prisma.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId, productId: item.productId } },
        data: { reserved: { increment: item.quantity } },
      })

      results.push(reservation)
    }

    return {
      reservations: results,
      errors: errors.length > 0 ? errors : undefined,
      allSucceeded: errors.length === 0,
    }
  },

  async release(cartId: string) {
    const reservations = await prisma.stockReservation.findMany({
      where: { cartId, status: 'ACTIVE' },
    })

    for (const reservation of reservations) {
      await prisma.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId: reservation.warehouseId, productId: reservation.productId } },
        data: { reserved: { decrement: reservation.quantity } },
      })
    }

    await prisma.stockReservation.updateMany({
      where: { cartId, status: 'ACTIVE' },
      data: { status: 'RELEASED' },
    })

    return { released: reservations.length }
  },

  async confirm(params: { cartId: string; saleId: string; userId: string }) {
    const { cartId, saleId, userId } = params

    const reservations = await prisma.stockReservation.findMany({
      where: { cartId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    })

    if (reservations.length === 0) {
      throw new Error('No active reservations found for this cart')
    }

    const movements = []

    for (const reservation of reservations) {
      const balance = await prisma.inventoryBalance.findUnique({
        where: { warehouseId_productId: { warehouseId: reservation.warehouseId, productId: reservation.productId } },
      })

      const previousStock = (balance?.quantity.toNumber() ?? 0) - (balance?.reserved ?? 0) + reservation.quantity
      const newStock = previousStock - reservation.quantity

      const movement = await prisma.$queryRawUnsafe<any>(
        `INSERT INTO "public"."InventoryMovement" 
          ("tenantId", "warehouseId", "productId", "movementType", "quantity", "previousStock", "currentStock", "referenceType", "referenceId", "createdBy", "createdAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
         RETURNING *`,
        reservation.tenantId,
        reservation.warehouseId,
        reservation.productId,
        'SALE',
        -reservation.quantity,
        previousStock,
        newStock,
        'SALE',
        saleId,
        userId
      )

      await prisma.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId: reservation.warehouseId, productId: reservation.productId } },
        data: {
          quantity: newStock,
          reserved: { decrement: reservation.quantity },
        },
      })

      await prisma.stockReservation.update({
        where: { id: reservation.id },
        data: { status: 'CONVERTED' },
      })

      movements.push(movement[0])
    }

    return { confirmed: reservations.length, movements }
  },

  async cleanupExpired() {
    const expired = await prisma.stockReservation.findMany({
      where: { status: 'ACTIVE', expiresAt: { lt: new Date() } },
    })

    let released = 0

    for (const reservation of expired) {
      await prisma.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId: reservation.warehouseId, productId: reservation.productId } },
        data: { reserved: { decrement: reservation.quantity } },
      })

      await prisma.stockReservation.update({
        where: { id: reservation.id },
        data: { status: 'RELEASED' },
      })

      released++
    }

    return { released }
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/reservation.service.ts
git commit -m "feat(inventory): add reservation service with reserve/release/confirm"
```

---

### Task 3: Create Reservation API Routes

**Files:**
- Create: `src/app/api/v1/inventory/reservation/route.ts`

- [ ] **Step 1: Create reservation route handler**

```typescript
import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { reservationService } from '@/lib/services/reservation.service'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'reserve') {
    const { warehouseId, cartId, items } = body
    const result = await reservationService.reserve({ tenantId, warehouseId, cartId, userId, items })
    if (!result.allSucceeded) {
      return successResponse(result, 'Partial reservation failed - some items unavailable', 200)
    }
    return successResponse(result, 'Stock reserved successfully', 201)
  }

  if (action === 'release') {
    const { cartId } = body
    const result = await reservationService.release(cartId)
    return successResponse(result, 'Reservation released', 200)
  }

  if (action === 'confirm') {
    const { cartId, saleId } = body
    const result = await reservationService.confirm({ cartId, saleId, userId })
    return successResponse(result, 'Reservation confirmed and stock deducted', 200)
  }

  return errorResponse('Invalid action. Use ?action=reserve|release|confirm', 400)
})
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/v1/inventory/reservation/route.ts
git commit -m "feat(api): add inventory reservation endpoint with reserve/release/confirm"
```

---

### Task 4: Create Reservation Cleanup Cron Job

**Files:**
- Create: `src/app/api/cron/reservation-cleanup/route.ts`

- [ ] **Step 1: Create cleanup route (can be called by external cron or Vercel cron)**

```typescript
import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { withErrorHandler } from '@/lib/api-handler'
import { reservationService } from '@/lib/services/reservation.service'

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const result = await reservationService.cleanupExpired()
  return successResponse(result, `Cleaned up ${result.released} expired reservations`)
})
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/cron/reservation-cleanup/route.ts
git commit -m "feat(cron): add reservation cleanup endpoint for expired reservations"
```

---

### Task 5: Update Cart Store for POS Integration

**Files:**
- Modify: `src/stores/cart-store.ts`

- [ ] **Step 1: Add cartId and reservation tracking to cart store**

```typescript
interface CartItem {
  productId: string
  name: string
  sku: string
  price: number
  quantity: number
  discount: number
  subtotal: number
  reserved?: number
}

interface CartState {
  items: CartItem[]
  customerId: string | null
  discount: number
  notes: string
  cartId: string
  warehouseId: string
  addItem: (item: Omit<CartItem, 'subtotal'>) => Promise<{ success: boolean; error?: string }>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean; error?: string }>
  updateDiscount: (productId: string, discount: number) => void
  setCustomer: (customerId: string | null) => void
  setGlobalDiscount: (discount: number) => void
  setNotes: (notes: string) => void
  clearCart: () => Promise<void>
  setWarehouse: (warehouseId: string) => void
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  discount: 0,
  notes: '',
  cartId: crypto.randomUUID(),
  warehouseId: '',

  setWarehouse: (warehouseId) => set({ warehouseId }),

  addItem: async (item) => {
    const state = get()
    const warehouseId = state.warehouseId
    if (!warehouseId) return { success: false, error: 'No warehouse selected' }

    const existing = state.items.find((i) => i.productId === item.productId)
    const newQuantity = existing ? existing.quantity + item.quantity : item.quantity

    try {
      const res = await fetch('/api/v1/inventory/reservation?action=reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId,
          cartId: state.cartId,
          items: [{ productId: item.productId, quantity: newQuantity }],
        }),
      })

      const data = await res.json()
      if (!res.ok) return { success: false, error: data.message || 'Reservation failed' }

      if (data.data?.errors?.length > 0) {
        return { success: false, error: `Only ${data.data.errors[0].available} available` }
      }

      if (existing) {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: newQuantity, subtotal: newQuantity * i.price - i.discount }
              : i
          ),
        }))
      } else {
        set((state) => ({
          items: [...state.items, { ...item, subtotal: item.quantity * item.price - item.discount }],
        }))
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  },

  removeItem: async (productId) => {
    const state = get()
    await fetch('/api/v1/inventory/reservation?action=release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId: state.cartId }),
    })
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }))
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(productId)
      return { success: true }
    }

    const state = get()
    try {
      const res = await fetch('/api/v1/inventory/reservation?action=reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: state.warehouseId,
          cartId: state.cartId,
          items: [{ productId, quantity }],
        }),
      })

      const data = await res.json()
      if (!res.ok || data.data?.errors?.length > 0) {
        const available = data.data?.errors?.[0]?.available ?? 0
        return { success: false, error: `Only ${available} available` }
      }

      set((state) => ({
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity, subtotal: quantity * i.price - i.discount } : i
        ),
      }))
      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  },

  updateDiscount: (productId, discount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, discount, subtotal: i.quantity * i.price - discount } : i
      ),
    })),

  setCustomer: (customerId) => set({ customerId }),
  setGlobalDiscount: (discount) => set({ discount }),
  setNotes: (notes) => set({ notes }),

  clearCart: async () => {
    const state = get()
    if (state.items.length > 0) {
      await fetch('/api/v1/inventory/reservation?action=release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: state.cartId }),
      })
    }
    set({ items: [], customerId: null, discount: 0, notes: '', cartId: crypto.randomUUID() })
  },

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
  getTotal: () => {
    const subtotal = get().items.reduce((sum, i) => sum + i.subtotal, 0)
    return subtotal - get().discount
  },
}))
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/cart-store.ts
git commit -m "feat(pos): integrate stock reservation into cart store"
```

---

## Phase 2: Reason Codes

### Task 6: Update Inventory Service for Reason Codes

**Files:**
- Modify: `src/lib/services/inventory.service.ts`

- [ ] **Step 1: Update stockOut method to accept reason parameter**

Replace the `stockOut` method (lines 84-149) with:

```typescript
async stockOut(params: {
  tenantId: string
  warehouseId: string
  productId: string
  quantity: number
  reason?: string
  note?: string
  referenceType?: string
  referenceId?: string
  createdBy: string
}) {
  const previousStock = await this.getCurrentStock(params.warehouseId, params.productId)

  if (previousStock < params.quantity) {
    const product = await prisma.product.findUnique({ where: { id: params.productId } })
    throw new InsufficientStockError(product?.name ?? 'Product')
  }

  const newStock = previousStock - params.quantity

  const result = await prisma.$queryRawUnsafe<any[]>(
    `INSERT INTO "public"."InventoryMovement" 
      ("tenantId", "warehouseId", "productId", "movementType", "quantity", "previousStock", "currentStock", "referenceType", "referenceId", "notes", "reason", "note", "createdBy", "createdAt") 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
     RETURNING *`,
    params.tenantId,
    params.warehouseId,
    params.productId,
    'SALE',
    -params.quantity,
    previousStock,
    newStock,
    params.referenceType || null,
    params.referenceId || null,
    params.note || null,
    params.reason || null,
    params.note || null,
    params.createdBy
  )

  const movement = result[0]

  await prisma.inventoryBalance.upsert({
    where: {
      warehouseId_productId: {
        warehouseId: params.warehouseId,
        productId: params.productId,
      },
    },
    update: { quantity: newStock },
    create: {
      tenantId: params.tenantId,
      warehouseId: params.warehouseId,
      productId: params.productId,
      quantity: newStock,
    },
  })

  await createAuditLog({
    tenantId: params.tenantId,
    userId: params.createdBy,
    entity: 'inventory',
    entityId: movement.id,
    action: 'STOCK_OUT',
    newValue: { quantity: -params.quantity, previousStock, newStock, reason: params.reason },
  })

  return movement
},
```

- [ ] **Step 2: Update adjust method to require reason for WASTAGE/BREAKAGE/THEFT/SHRINKAGE**

Replace the `adjust` method (lines 151-208) with:

```typescript
async adjust(params: {
  tenantId: string
  warehouseId: string
  productId: string
  newQuantity: number
  reason?: 'WASTAGE' | 'BREAKAGE' | 'THEFT' | 'SHRINKAGE' | 'ADJUSTMENT'
  note?: string
  createdBy: string
}) {
  const previousStock = await this.getCurrentStock(params.warehouseId, params.productId)
  const difference = params.newQuantity - previousStock

  const movementType = params.reason || 'ADJUSTMENT'

  const result = await prisma.$queryRawUnsafe<any[]>(
    `INSERT INTO "public"."InventoryMovement" 
      ("tenantId", "warehouseId", "productId", "movementType", "quantity", "previousStock", "currentStock", "referenceType", "referenceId", "notes", "reason", "note", "createdBy", "createdAt") 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
     RETURNING *`,
    params.tenantId,
    params.warehouseId,
    params.productId,
    movementType,
    difference,
    previousStock,
    params.newQuantity,
    null,
    null,
    params.note || null,
    params.reason || null,
    params.note || null,
    params.createdBy
  )

  const movement = result[0]

  await prisma.inventoryBalance.upsert({
    where: {
      warehouseId_productId: {
        warehouseId: params.warehouseId,
        productId: params.productId,
      },
    },
    update: { quantity: params.newQuantity },
    create: {
      tenantId: params.tenantId,
      warehouseId: params.warehouseId,
      productId: params.productId,
      quantity: params.newQuantity,
    },
  })

  await createAuditLog({
    tenantId: params.tenantId,
    userId: params.createdBy,
    entity: 'inventory',
    entityId: movement.id,
    action: 'ADJUSTMENT',
    newValue: { previousStock, newStock: params.newQuantity, difference, reason: params.reason },
  })

  return movement
},
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/services/inventory.service.ts
git commit -m "feat(inventory): add reason codes for stock movements"
```

---

### Task 7: Update Inventory Route for Reason Codes

**Files:**
- Modify: `src/app/api/v1/inventory/route.ts`
- Modify: `src/validators/inventory.ts`

- [ ] **Step 1: Read current validators**

- [ ] **Step 2: Add reason to stock-out validation**

In `stockOutSchema`, add after quantity:
```typescript
reason: z.enum(['WASTAGE', 'BREAKAGE', 'THEFT', 'SHRINKAGE']).optional(),
note: z.string().optional(),
```

In `adjustmentSchema`, add:
```typescript
reason: z.enum(['WASTAGE', 'BREAKAGE', 'THEFT', 'SHRINKAGE', 'ADJUSTMENT']).optional(),
note: z.string().optional(),
```

- [ ] **Step 3: Update inventory route POST handler for stock-out and adjust**

In the POST handler for `action === 'stock-out'`, pass reason and note:
```typescript
const movement = await inventoryService.stockOut({ ...input, tenantId, createdBy: userId })
```

In `action === 'adjust'`:
```typescript
const movement = await inventoryService.adjust({ ...input, tenantId, createdBy: userId })
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/v1/inventory/route.ts src/validators/inventory.ts
git commit -m "feat(inventory): require reason code for adjustments"
```

---

### Task 8: Create Shrinkage Report Endpoint

**Files:**
- Create: `src/app/api/v1/reports/inventory/route.ts`

- [ ] **Step 1: Create inventory reports route**

```typescript
import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, withErrorHandler } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const params = await parseSearchParams(request)
  const type = params.type as string

  if (type === 'shrinkage') {
    const startDate = params.startDate ? new Date(params.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = params.endDate ? new Date(params.endDate as string) : new Date()

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        tenantId,
        movementType: { in: ['WASTAGE', 'BREAKAGE', 'THEFT', 'SHRINKAGE'] },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const summary = {
      totalWastage: movements.filter((m) => m.movementType === 'WASTAGE').reduce((sum, m) => sum + Math.abs(m.quantity.toNumber()), 0),
      totalBreakage: movements.filter((m) => m.movementType === 'BREAKAGE').reduce((sum, m) => sum + Math.abs(m.quantity.toNumber()), 0),
      totalTheft: movements.filter((m) => m.movementType === 'THEFT').reduce((sum, m) => sum + Math.abs(m.quantity.toNumber()), 0),
      totalShrinkage: movements.filter((m) => m.movementType === 'SHRINKAGE').reduce((sum, m) => sum + Math.abs(m.quantity.toNumber()), 0),
    }
    summary.totalLoss = summary.totalWastage + summary.totalBreakage + summary.totalTheft + summary.totalShrinkage

    return successResponse({ data: movements, summary }, 'Shrinkage report retrieved')
  }

  return successResponse(null, 'Invalid report type')
})
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/v1/reports/inventory/route.ts
git commit -m "feat(reports): add shrinkage inventory report"
```

---

## Phase 3: Stock Opname

### Task 9: Create Opname Service

**Files:**
- Create: `src/lib/services/opname.service.ts`

- [ ] **Step 1: Create opname service**

```typescript
import { prisma } from '@/lib/prisma'
import { NotFoundError, ForbiddenError } from '@/lib/errors'

export const opnameService = {
  async start(params: { tenantId: string; warehouseId: string; notes?: string; createdBy: string }) {
    const { tenantId, warehouseId, notes, createdBy } = params

    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, tenantId },
    })
    if (!warehouse) throw new NotFoundError('Warehouse')

    const balances = await prisma.inventoryBalance.findMany({
      where: { warehouseId, quantity: { not: { equals: 0 } } },
      include: { product: { select: { id: true, name: true, sku: true } } },
    })

    const opname = await prisma.stockOpname.create({
      data: {
        tenantId,
        warehouseId,
        status: 'DRAFT',
        notes,
        createdBy,
        items: {
          create: balances.map((b) => ({
            productId: b.productId,
            systemQty: b.quantity,
            actualQty: 0,
            differenceQty: 0,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        warehouse: true,
      },
    })

    return opname
  },

  async getById(opnameId: string, tenantId: string) {
    const opname = await prisma.stockOpname.findFirst({
      where: { id: opnameId, tenantId },
      include: {
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        warehouse: true,
      },
    })
    if (!opname) throw new NotFoundError('Stock opname')
    return opname
  },

  async submitCounts(params: { opnameId: string; tenantId: string; items: Array<{ productId: string; countedQty: number }>; submittedBy: string }) {
    const { opnameId, tenantId, items, submittedBy } = params

    const opname = await this.getById(opnameId, tenantId)
    if (opname.status !== 'DRAFT') throw new Error('Can only submit counts for DRAFT opname')

    for (const item of items) {
      await prisma.stockOpnameItem.update({
        where: { id: item.productId },
        data: {
          actualQty: item.countedQty,
          differenceQty: item.countedQty - (await this.getItemSystemQty(item.productId)),
        },
      })
    }

    const updated = await prisma.stockOpname.update({
      where: { id: opnameId },
      data: { status: 'SUBMITTED' },
      include: { items: { include: { product: true } } },
    })

    return updated
  },

  async approve(params: { opnameId: string; tenantId: string; userId: string }) {
    const { opnameId, tenantId, userId } = params

    const opname = await this.getById(opnameId, tenantId)
    if (opname.status !== 'SUBMITTED') throw new Error('Can only approve SUBMITTED opname')

    for (const item of opname.items) {
      const difference = item.differenceQty.toNumber()
      if (difference === 0) continue

      const balance = await prisma.inventoryBalance.findUnique({
        where: { warehouseId_productId: { warehouseId: opname.warehouseId, productId: item.productId } },
      })
      const previousStock = balance?.quantity.toNumber() ?? 0
      const newStock = previousStock + difference

      await prisma.$queryRawUnsafe<any>(
        `INSERT INTO "public"."InventoryMovement" 
          ("tenantId", "warehouseId", "productId", "movementType", "quantity", "previousStock", "currentStock", "referenceType", "referenceId", "createdBy", "createdAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        tenantId,
        opname.warehouseId,
        item.productId,
        'STOCK_OPNAME',
        difference,
        previousStock,
        newStock,
        'STOCK_OPNAME',
        opnameId,
        userId
      )

      await prisma.inventoryBalance.upsert({
        where: { warehouseId_productId: { warehouseId: opname.warehouseId, productId: item.productId } },
        data: { quantity: newStock },
        create: { tenantId, warehouseId: opname.warehouseId, productId: item.productId, quantity: newStock },
      })
    }

    const updated = await prisma.stockOpname.update({
      where: { id: opnameId },
      data: { status: 'APPROVED', approvedBy: userId },
    })

    return updated
  },

  async reject(params: { opnameId: string; tenantId: string; userId: string; reason: string }) {
    const { opnameId, tenantId, userId, reason } = params

    const opname = await this.getById(opnameId, tenantId)
    if (opname.status !== 'SUBMITTED') throw new Error('Can only reject SUBMITTED opname')

    await prisma.stockOpnameItem.updateMany({
      where: { stockOpnameId: opnameId },
      data: { actualQty: 0, differenceQty: 0 },
    })

    const updated = await prisma.stockOpname.update({
      where: { id: opnameId },
      data: { status: 'REJECTED' },
    })

    return updated
  },

  async getItemSystemQty(productId: string) {
    const item = await prisma.stockOpnameItem.findFirst({ where: { productId } })
    return item?.systemQty.toNumber() ?? 0
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/opname.service.ts
git commit -m "feat(opname): add stock opname service with approve/reject workflow"
```

---

### Task 10: Create Opname API Routes

**Files:**
- Create: `src/app/api/v1/inventory/opname/route.ts`
- Create: `src/app/api/v1/inventory/opname/[id]/route.ts`

- [ ] **Step 1: Create opname route (start opname)**

```typescript
import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { opnameService } from '@/lib/services/opname.service'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const { warehouseId, notes } = body
  const opname = await opnameService.start({ tenantId, warehouseId, notes, createdBy: userId })
  return successResponse(opname, 'Stock opname started', 201)
})
```

- [ ] **Step 2: Create opname [id] route**

```typescript
import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { opnameService } from '@/lib/services/opname.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const opname = await opnameService.getById(id, tenantId)
  return successResponse(opname)
})

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'submit') {
    const { items } = body
    const opname = await opnameService.submitCounts({ opnameId: id, tenantId, items, submittedBy: userId })
    return successResponse(opname, 'Counts submitted')
  }

  if (action === 'approve') {
    const opname = await opnameService.approve({ opnameId: id, tenantId, userId })
    return successResponse(opname, 'Opname approved and inventory adjusted')
  }

  if (action === 'reject') {
    const { reason } = body
    const opname = await opnameService.reject({ opnameId: id, tenantId, userId, reason })
    return successResponse(opname, 'Opname rejected, please recount')
  }

  return errorResponse('Invalid action. Use ?action=submit|approve|reject', 400)
})
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/v1/inventory/opname/route.ts src/app/api/v1/inventory/opname/[id]/route.ts
git commit -m "feat(api): add stock opname endpoints"
```

---

## Phase 4: Low Stock & POS Updates

### Task 11: Create Low Stock Report Endpoint

**Files:**
- Create: `src/app/api/v1/reports/inventory/low-stock/route.ts`

- [ ] **Step 1: Create low-stock endpoint**

```typescript
import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)

  const lowStock = await prisma.$queryRawUnsafe<any[]>(
    `SELECT 
      ib."productId",
      p.name as "productName",
      p.sku,
      p."minStock",
      p."maxStock",
      ib.quantity as "currentStock",
      ib."warehouseId",
      w.name as "warehouseName",
      (p."minStock" - ib.quantity) as "deficit"
     FROM "InventoryBalance" ib
     JOIN "Product" p ON p.id = ib."productId"
     JOIN "Warehouse" w ON w.id = ib."warehouseId"
     WHERE ib."tenantId" = $1 
       AND ib.quantity <= COALESCE(p."minStock", 0)
       AND p.deletedAt IS NULL
     ORDER BY "deficit" DESC`,
    tenantId
  )

  const critical = lowStock.filter((i) => i.currentStock.toNumber() === 0)
  const warning = lowStock.filter((i) => i.currentStock.toNumber() > 0)

  return successResponse({ critical, warning, all: lowStock }, 'Low stock items retrieved')
})
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/v1/reports/inventory/low-stock/route.ts
git commit -m "feat(reports): add low stock report endpoint"
```

---

### Task 12: Update Products API for POS Mode

**Files:**
- Modify: `src/app/api/v1/products/route.ts`

- [ ] **Step 1: Add includeStock mode to products GET**

Add to the GET handler after validating tenantId:

```typescript
const url = new URL(request.url)
const includeStock = url.searchParams.get('includeStock') === 'true'
const warehouseId = url.searchParams.get('warehouseId')

if (includeStock && warehouseId) {
  const products = await inventoryRepository.getProductsWithStock(tenantId, warehouseId)
  return successResponse(products)
}
```

- [ ] **Step 2: Add getProductsWithStock to inventory repository**

```typescript
async getProductsWithStock(tenantId: string, warehouseId: string) {
  const products = await prisma.product.findMany({
    where: { tenantId, isActive: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      sku: true,
      barcode: true,
      sellingPrice: true,
      image: true,
      minStock: true,
      maxStock: true,
    },
  })

  const balances = await prisma.inventoryBalance.findMany({
    where: { warehouseId },
    select: { productId: true, quantity: true, reserved: true },
  })

  const balanceMap = new Map(balances.map((b) => [b.productId, b]))

  return products.map((p) => {
    const balance = balanceMap.get(p.id)
    const qty = balance?.quantity?.toNumber() ?? 0
    const reserved = balance?.reserved ?? 0
    const available = qty - reserved
    return {
      ...p,
      stock: { balance: qty, reserved, available },
    }
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/v1/products/route.ts
git commit -m "feat(api): add includeStock mode to products endpoint for POS"
```

---

### Task 13: Update POS Page for Real-Time Stock Display

**Files:**
- Modify: `src/app/app/pos/page.tsx`

- [ ] **Step 1: Update POS page to show available stock and disable out-of-stock items**

Key changes needed in the product grid:
- Fetch products with `?includeStock=true&warehouseId=X`
- Show "X available" badge
- Disable products with available === 0
- Show "Only X left" warning when available < minStock

- [ ] **Step 2: Commit**

```bash
git add src/app/app/pos/page.tsx
git commit -m "feat(pos): show real-time available stock at POS"
```

---

### Task 14: Update Dashboard Low Stock Widget

**Files:**
- Modify: `src/app/app/dashboard/page.tsx`

- [ ] **Step 1: Improve low stock widget to show critical vs warning counts**

Key changes:
- Fetch from `/api/v1/reports/inventory/low-stock`
- Show count of critical (stock = 0) vs warning items
- Add link to low stock report

- [ ] **Step 2: Commit**

```bash
git add src/app/app/dashboard/page.tsx
git commit -m "feat(dashboard): improve low stock alerts widget"
```

---

## Spec Coverage Checklist

- [x] Stock Reservation (Phase 1) - Tasks 1-5
- [x] Movement Reason Codes (Phase 2) - Tasks 6-8
- [x] Stock Opname Workflow (Phase 3) - Tasks 9-10
- [x] Low Stock Alerts (Phase 4) - Tasks 11, 14
- [x] POS Real-Time Stock (Phase 4) - Tasks 12-13
- [x] Shrinkage Report (Phase 2) - Task 8

## Dependencies

- Prisma 7 with PostgreSQL (already in use)
- Zustand for state (already in use)
- React Hook Form + Zod (already in use)
- Next.js 15 API routes (already in use)
- Cron job capability for reservation cleanup

## Estimated Tasks

Total: 14 tasks across 4 phases
Phase 1 (Stock Reservation): 5 tasks
Phase 2 (Reason Codes): 3 tasks
Phase 3 (Stock Opname): 2 tasks
Phase 4 (Low Stock & POS): 4 tasks

---

## Plan Complete

**Next: Choose execution approach**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
