# Invoice & Receipt Printing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement invoice and receipt printing with thermal (80mm) and A4 support, QR verification codes, and manual print button.

**Architecture:** Print service generates receipt/invoice data, React components render templates, browser print dialog handles actual printing, QR code links to verification page.

**Tech Stack:** Next.js 15, React, html-to-image (for rendering), qrcode (for QR generation), browser print API

---

## File Structure

### Phase 1: Print Service & API
- Create: `src/lib/services/print.service.ts` - Receipt/invoice data generation
- Create: `src/app/api/v1/sales/[id]/receipt/route.ts` - Receipt endpoint
- Create: `src/app/api/v1/sales/[id]/invoice/route.ts` - Invoice endpoint

### Phase 2: Print Templates
- Create: `src/components/shared/receipt-template.tsx` - Thermal receipt component
- Create: `src/components/shared/invoice-template.tsx` - A4 invoice component
- Create: `src/components/shared/qr-code.tsx` - QR code generator

### Phase 3: Print Dialog & Integration
- Create: `src/app/app/pos/print-dialog.tsx` - Print buttons modal
- Modify: `src/app/app/pos/page.tsx` - Show print dialog after sale completes
- Create: `src/app/app/verify/[invoiceNumber]/page.tsx` - QR verification page

---

## Phase 1: Print Service & API

### Task 1: Create Print Service

**Files:**
- Create: `src/lib/services/print.service.ts`

- [ ] **Step 1: Create print service**

```typescript
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReceiptItem {
  sku: string
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface ReceiptData {
  invoiceNumber: string
  date: string
  time: string
  cashier: string
  branch: string
  items: ReceiptItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  cashReceived: number
  change: number
  verifyUrl: string
}

interface InvoiceData extends ReceiptData {
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  address?: string
  paymentDetails: {
    method: string
    amount: number
    reference?: string
  }[]
  footerText: string
}

export const printService = {
  async getReceiptData(saleId: string, tenantId: string): Promise<ReceiptData> {
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: {
        items: { include: { product: true } },
        payments: { include: { paymentMethod: true } },
        createdByUser: { select: { name: true } },
        branch: true,
        customer: true,
      },
    })

    if (!sale) throw new Error('Sale not found')

    const payment = sale.payments[0]
    const items: ReceiptItem[] = sale.items.map((item) => ({
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity.toNumber(),
      price: item.price.toNumber(),
      subtotal: item.subtotal.toNumber(),
    }))

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/app/verify/${sale.invoiceNumber}`

    return {
      invoiceNumber: sale.invoiceNumber,
      date: formatDate(sale.createdAt),
      time: new Date(sale.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      cashier: sale.createdByUser?.name || 'Unknown',
      branch: sale.branch.name,
      items,
      subtotal: sale.subtotal.toNumber(),
      discount: sale.discount.toNumber(),
      total: sale.total.toNumber(),
      paymentMethod: payment?.paymentMethod?.name || 'Unknown',
      cashReceived: payment?.amount.toNumber() || sale.total.toNumber(),
      change: payment ? payment.amount.toNumber() - sale.total.toNumber() : 0,
      verifyUrl,
    }
  },

  async getInvoiceData(saleId: string, tenantId: string): Promise<InvoiceData> {
    const receipt = await this.getReceiptData(saleId, tenantId)

    const sale = await prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { customer: true, payments: { include: { paymentMethod: true } } },
    })

    const paymentDetails = sale?.payments.map((p) => ({
      method: p.paymentMethod.name,
      amount: p.amount.toNumber(),
      reference: p.referenceNumber || undefined,
    })) || []

    return {
      ...receipt,
      customerName: sale?.customer?.name,
      customerPhone: sale?.customer?.phone,
      customerEmail: sale?.customer?.email,
      address: sale?.customer?.address,
      paymentDetails,
      footerText: 'This is a computer-generated invoice. No signature required.',
    }
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/print.service.ts
git commit -m "feat(print): add print service for receipt and invoice data"
```

---

### Task 2: Create Receipt API Endpoint

**Files:**
- Create: `src/app/api/v1/sales/[id]/receipt/route.ts`

- [ ] **Step 1: Create receipt endpoint**

```typescript
import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { printService } from '@/lib/services/print.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)

  const receipt = await printService.getReceiptData(id, tenantId)
  return successResponse(receipt)
})
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/v1/sales/[id]/receipt/route.ts
git commit -m "feat(api): add receipt endpoint"
```

---

### Task 3: Create Invoice API Endpoint

**Files:**
- Create: `src/app/api/v1/sales/[id]/invoice/route.ts`

- [ ] **Step 1: Create invoice endpoint**

```typescript
import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { printService } from '@/lib/services/print.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)

  const invoice = await printService.getInvoiceData(id, tenantId)
  return successResponse(invoice)
})
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/v1/sales/[id]/invoice/route.ts
git commit -m "feat(api): add invoice endpoint"
```

---

## Phase 2: Print Templates

### Task 4: Create QR Code Component

**Files:**
- Create: `src/components/shared/qr-code.tsx`

- [ ] **Step 1: Create QR code component using qrcode library**

First check if qrcode is installed:
```bash
npm list qrcode
```

If not installed, install it:
```bash
npm install qrcode && npm install -D @types/qrcode
```

Create the component:
```tsx
'use client'

import { useEffect, useState } from 'react'

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 120 }: QRCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>('')

  useEffect(() => {
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }).then(setQrUrl)
    })
  }, [value, size])

  if (!qrUrl) return <div style={{ width: size, height: size }} />

  return <img src={qrUrl} alt="QR Code" width={size} height={size} />
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/qr-code.tsx
git commit -m "feat(print): add QR code component"
```

---

### Task 5: Create Receipt Template Component

**Files:**
- Create: `src/components/shared/receipt-template.tsx`

- [ ] **Step 1: Create thermal receipt template**

```tsx
'use client'

import { QRCode } from './qr-code'
import { formatCurrency } from '@/lib/utils'

interface ReceiptTemplateProps {
  data: {
    invoiceNumber: string
    date: string
    time: string
    cashier: string
    branch: string
    items: { sku: string; name: string; quantity: number; price: number; subtotal: number }[]
    subtotal: number
    discount: number
    total: number
    paymentMethod: string
    cashReceived: number
    change: number
    verifyUrl: string
  }
  businessName?: string
  businessAddress?: string
  businessPhone?: string
}

export function ReceiptTemplate({ data, businessName = 'TOKO AMAN', businessAddress = '', businessPhone = '' }: ReceiptTemplateProps) {
  return (
    <div style={{ width: '280px', fontFamily: 'monospace', fontSize: '12px', padding: '8px' }}>
      <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{businessName}</div>
        {businessAddress && <div>{businessAddress}</div>}
        {businessPhone && <div>Telp: {businessPhone}</div>}
      </div>

      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Invoice #:</span>
          <span>{data.invoiceNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{data.date}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Time:</span>
          <span>{data.time}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Cashier:</span>
          <span>{data.cashier}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Branch:</span>
          <span>{data.branch}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', fontWeight: 'bold' }}>
          <span>SKU</span>
          <span>Item</span>
          <span style={{ textAlign: 'center' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Price</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
        {data.items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '2px' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sku}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
            <span style={{ textAlign: 'center' }}>{item.quantity}</span>
            <span style={{ textAlign: 'right' }}>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(data.subtotal)}</span>
        </div>
        {data.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d00' }}>
            <span>Discount:</span>
            <span>-{formatCurrency(data.discount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(data.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>CASH:</span>
          <span>{formatCurrency(data.cashReceived)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>CHANGE:</span>
          <span>{formatCurrency(data.change)}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px', textAlign: 'center' }}>
        <div>Payment: {data.paymentMethod}</div>
      </div>

      <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', marginBottom: '8px' }}>{data.verifyUrl}</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <QRCode value={data.verifyUrl} size={80} />
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '10px' }}>
        Thank you for your purchase!
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/receipt-template.tsx
git commit -m "feat(print): add thermal receipt template"
```

---

### Task 6: Create Invoice Template Component

**Files:**
- Create: `src/components/shared/invoice-template.tsx`

- [ ] **Step 1: Create A4 invoice template**

```tsx
'use client'

import { QRCode } from './qr-code'
import { formatCurrency, formatDate } from '@/lib/utils'

interface InvoiceTemplateProps {
  data: {
    invoiceNumber: string
    date: string
    time: string
    cashier: string
    branch: string
    items: { sku: string; name: string; quantity: number; price: number; subtotal: number }[]
    subtotal: number
    discount: number
    total: number
    paymentMethod: string
    cashReceived: number
    change: number
    verifyUrl: string
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    address?: string
    paymentDetails: { method: string; amount: number; reference?: string }[]
    footerText?: string
  }
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
}

export function InvoiceTemplate({
  data,
  businessName = 'TOKO AMAN',
  businessAddress = '',
  businessPhone = '',
  businessEmail = ''
}: InvoiceTemplateProps) {
  return (
    <div style={{ width: '210mm', fontFamily: 'Arial, sans-serif', fontSize: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{businessName}</div>
          {businessAddress && <div>{businessAddress}</div>}
          {businessPhone && <div>Telp: {businessPhone}</div>}
          {businessEmail && <div>Email: {businessEmail}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>INVOICE</div>
          <div>Invoice #: {data.invoiceNumber}</div>
          <div>Date: {data.date}</div>
          <div>Time: {data.time}</div>
          <div>Cashier: {data.cashier}</div>
          <div>Branch: {data.branch}</div>
        </div>
      </div>

      {data.customerName && (
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <strong>CUSTOMER INFORMATION</strong>
          <div style={{ display: 'flex', gap: '20px' }}>
            {data.customerName && <span>Name: {data.customerName}</span>}
            {data.customerPhone && <span>Phone: {data.customerPhone}</span>}
            {data.customerEmail && <span>Email: {data.customerEmail}</span>}
          </div>
          {data.address && <div>Address: {data.address}</div>}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>NO</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>ITEM</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>SKU</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>QTY</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>UNIT PRICE</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{i + 1}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{item.name}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{item.sku}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          {data.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Discount:</span>
              <span>-{formatCurrency(data.discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid #000' }}>
            <span>TOTAL:</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
        <strong>PAYMENT DETAILS</strong>
        {data.paymentDetails.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', padding: '2px 0' }}>
            <span>{p.method}:</span>
            <span>{formatCurrency(p.amount)}</span>
            {p.reference && <span>Ref: {p.reference}</span>}
          </div>
        ))}
        <div style={{ display: 'flex', gap: '20px', padding: '4px 0', fontWeight: 'bold' }}>
          <span>Change:</span>
          <span>{formatCurrency(data.change)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>{data.verifyUrl}</div>
          <QRCode value={data.verifyUrl} size={100} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '10px' }}>
          {data.footerText || 'Thank you for your purchase!'}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/invoice-template.tsx
git commit -m "feat(print): add A4 invoice template"
```

---

## Phase 3: Print Dialog & Integration

### Task 7: Create Print Dialog Component

**Files:**
- Create: `src/app/app/pos/print-dialog.tsx`

- [ ] **Step 1: Create print dialog with print buttons**

```tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ReceiptTemplate } from '@/components/shared/receipt-template'
import { InvoiceTemplate } from '@/components/shared/invoice-template'
import { formatCurrency } from '@/lib/utils'

interface PrintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  saleId: string
  receiptData: any
  invoiceData: any
}

export function PrintDialog({ open, onOpenChange, saleId, receiptData, invoiceData }: PrintDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !receiptRef.current) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receiptData.invoiceNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `)
  }

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !invoiceRef.current) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceData.invoiceNumber}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${invoiceRef.current.innerHTML}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Print Receipt / Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{formatCurrency(receiptData?.total || 0)}</p>
            <p className="text-sm text-muted-foreground">{receiptData?.invoiceNumber}</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
            <Button className="flex-1" variant="outline" onClick={handlePrintInvoice}>
              Print Invoice
            </Button>
          </div>

          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Done (No Print)
          </Button>
        </div>

        <div style={{ position: 'absolute', left: '-9999px' }}>
          <div ref={receiptRef}>
            {receiptData && <ReceiptTemplate data={receiptData} />}
          </div>
          <div ref={invoiceRef}>
            {invoiceData && <InvoiceTemplate data={invoiceData} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/app/pos/print-dialog.tsx
git commit -m "feat(print): add print dialog component"
```

---

### Task 8: Integrate Print Dialog in POS Page

**Files:**
- Modify: `src/app/app/pos/page.tsx`

- [ ] **Step 1: Add print dialog to POS page**

Read the current POS page. After successful checkout, instead of immediately clearing cart, show the print dialog:

```tsx
// Add state for print dialog
const [printDialogOpen, setPrintDialogOpen] = useState(false)
const [lastSaleData, setLastSaleData] = useState<any>(null)
const [receiptData, setReceiptData] = useState<any>(null)
const [invoiceData, setInvoiceData] = useState<any>(null)
```

After successful checkout:
```tsx
// After sale is created successfully
setLastSaleData(result.data)
setPrintDialogOpen(true)
```

Add useEffect to fetch print data when lastSaleData changes:
```tsx
useEffect(() => {
  if (!lastSaleData) return
  
  const fetchPrintData = async () => {
    const [receiptRes, invoiceRes] = await Promise.all([
      fetch(`/api/v1/sales/${lastSaleData.id}/receipt`),
      fetch(`/api/v1/sales/${lastSaleData.id}/invoice`),
    ])
    const [receipt, invoice] = await Promise.all([
      receiptRes.json(),
      invoiceRes.json(),
    ])
    setReceiptData(receipt.data)
    setInvoiceData(invoice.data)
  }
  
  fetchPrintData()
}, [lastSaleData])
```

Add in the return statement (before closing tags):
```tsx
{printDialogOpen && receiptData && invoiceData && (
  <PrintDialog
    open={printDialogOpen}
    onOpenChange={(open) => {
      setPrintDialogOpen(open)
      if (!open) {
        setLastSaleData(null)
        setReceiptData(null)
        setInvoiceData(null)
        clearCart()
      }
    }}
    saleId={lastSaleData.id}
    receiptData={receiptData}
    invoiceData={invoiceData}
  />
)}
```

Import PrintDialog:
```tsx
import { PrintDialog } from './print-dialog'
```

- [ ] **Step 2: Commit**

```bash
git add src/app/app/pos/page.tsx
git commit -m "feat(pos): integrate print dialog after checkout"
```

---

### Task 9: Create QR Verification Page

**Files:**
- Create: `src/app/app/verify/[invoiceNumber]/page.tsx`

- [ ] **Step 1: Create verification page**

```tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

interface VerifyPageProps {
  params: Promise<{ invoiceNumber: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { invoiceNumber } = await params

  const sale = await prisma.sale.findFirst({
    where: { invoiceNumber },
    include: {
      branch: true,
      customer: true,
      items: { include: { product: true } },
      payments: { include: { paymentMethod: true } },
    },
  })

  if (!sale) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">This invoice number does not exist in our system.</p>
        </div>
      </div>
    )
  }

  const isValid = sale.status === 'COMPLETED'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <CheckCircle className={`w-16 h-16 mx-auto ${isValid ? 'text-green-500' : 'text-red-500'} mb-4`} />
          <h1 className="text-2xl font-bold">
            {isValid ? 'Invoice Verified' : 'Invoice Invalid'}
          </h1>
          <p className="text-gray-600">
            {isValid ? 'This is an authentic receipt.' : 'This invoice has been cancelled or refunded.'}
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Invoice Number</span>
            <span className="font-medium">{sale.invoiceNumber}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{formatDate(sale.createdAt)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Branch</span>
            <span className="font-medium">{sale.branch.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-lg">{formatCurrency(sale.total.toNumber())}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Items</h3>
          <div className="space-y-1 text-sm">
            {sale.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.quantity}x {item.product.name}</span>
                <span>{formatCurrency(item.subtotal.toNumber())}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          Powered by POSCal
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/app/verify/[invoiceNumber]/page.tsx
git commit -m "feat(print): add QR verification page"
```

---

## Spec Coverage Checklist

- [x] Print service with receipt/invoice data
- [x] Receipt API endpoint
- [x] Invoice API endpoint
- [x] QR code component
- [x] Thermal receipt template (80mm)
- [x] A4 invoice template
- [x] Print dialog with print buttons
- [x] POS integration (show dialog after sale)
- [x] QR verification page

## Dependencies

- qrcode library (install if not present)
- html-to-image (optional, using native browser print)
- Browser print API (built-in)

## Estimated Tasks

Total: 9 tasks
Phase 1: 3 tasks (service + 2 API routes)
Phase 2: 3 tasks (QR + 2 templates)
Phase 3: 3 tasks (dialog + POS integration + verify page)

---

## Plan Complete

**Next: Choose execution approach**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
