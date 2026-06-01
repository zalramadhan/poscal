'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toJpeg } from 'html-to-image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReceiptTemplate } from '@/components/shared/receipt-template'
import { InvoiceTemplate } from '@/components/shared/invoice-template'
import {
  ArrowLeft,
  Printer,
  ImageDown,
  RotateCcw,
  CheckCircle,
  CreditCard,
  DollarSign,
  Smartphone,
  Building2,
  User,
  Package,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useFetch } from '@/hooks'
import type { Sale } from '@/types'

interface DisplaySale {
  id: string
  invoiceNumber: string
  customer: string
  subtotal: number
  discount: number
  total: number
  status: string
  items: { id: string; name: string; sku: string; quantity: number; price: number; subtotal: number }[]
  payments: { id: string; method: string; amount: number; referenceNumber?: string }[]
  branch: string
  cashier: string
  notes?: string
  createdAt: string
}

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  COMPLETED: { variant: 'success', label: 'Completed' },
  DRAFT: { variant: 'default', label: 'Draft' },
  HOLD: { variant: 'warning', label: 'On Hold' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  REFUNDED: { variant: 'info', label: 'Refunded' },
}

const paymentIcons: Record<string, React.ElementType> = {
  Cash: DollarSign,
  'Debit Card': CreditCard,
  QRIS: Smartphone,
}

function mapSaleToDisplay(sale: Sale): DisplaySale {
  return {
    id: sale.id,
    invoiceNumber: sale.invoiceNumber,
    customer: sale.customer?.name || 'Walk-in',
    subtotal: sale.subtotal,
    discount: sale.discount,
    total: sale.total,
    status: sale.status,
    items: (sale.items || []).map((item) => ({
      id: item.id,
      name: item.product?.name || 'Unknown',
      sku: item.product?.sku || '',
      quantity: Number(item.quantity),
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
    payments: (sale.payments || []).map((p) => ({
      id: p.id,
      method: p.paymentMethod?.name || 'Unknown',
      amount: Number(p.amount),
      referenceNumber: p.referenceNumber || undefined,
    })),
    branch: sale.branch?.name || '-',
    cashier: sale.createdBy || 'System',
    notes: sale.notes || undefined,
    createdAt: sale.createdAt,
  }
}

export default function SaleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: saleData, loading, error, refetch } = useFetch<Sale>(`/api/v1/sales/${id}`)
  const [exporting, setExporting] = React.useState<'print' | 'jpeg' | null>(null)
  const receiptRef = React.useRef<HTMLDivElement>(null)
  const invoiceRef = React.useRef<HTMLDivElement>(null)

  if (loading) return <LoadingState message="Loading sale detail..." />
  if (error) {
    return (
      <ErrorState
        title="Error"
        message={error}
        onRetry={refetch}
      />
    )
  }
  if (!saleData) {
    return (
      <ErrorState
        title="Sale not found"
        message="The sale you're looking for doesn't exist."
        onRetry={() => router.refresh()}
      />
    )
  }

  const sale = mapSaleToDisplay(saleData)
  const statusInfo = statusConfig[sale.status] || { variant: 'default' as const, label: sale.status }

  async function handlePrint() {
    if (!receiptRef.current) return
    setExporting('print')
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        setExporting(null)
        return
      }
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${sale.invoiceNumber}</title>
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
      printWindow.document.close()
    } catch {
      window.print()
    }
    setExporting(null)
  }

  async function handleExportJPEG() {
    if (!invoiceRef.current) return
    setExporting('jpeg')
    try {
      const dataUrl = await toJpeg(invoiceRef.current, { quality: 0.95, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `Invoice-${sale.invoiceNumber}.jpg`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Export failed:', err)
    }
    setExporting(null)
  }

  async function handleRefund() {
    if (!confirm(`Refund invoice #${sale.invoiceNumber}? This action cannot be undone.`)) return
    setExporting('print') // reuse as loading indicator
    try {
      const res = await fetch(`/api/v1/sales/${id}`, { method: 'POST' })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Refund failed')
      refetch()
    } catch (err: any) {
      alert(err.message)
    }
    setExporting(null)
  }

  return (
    <div>
      <PageHeader title={`Invoice #${sale.invoiceNumber}`}>
        <Link href="/app/pos/history">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Button variant="outline" onClick={handlePrint} disabled={exporting === 'print'}>
          <Printer className="h-4 w-4 mr-2" />
          {exporting === 'print' ? 'Printing...' : 'Print'}
        </Button>
        <Button variant="outline" onClick={handleExportJPEG} disabled={exporting === 'jpeg'}>
          <ImageDown className="h-4 w-4 mr-2" />
          {exporting === 'jpeg' ? 'Exporting...' : 'Export JPEG'}
        </Button>
      </PageHeader>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg">
        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-lg border ${
          sale.status === 'COMPLETED'
            ? 'bg-success/5 border-success/20'
            : sale.status === 'REFUNDED'
            ? 'bg-info/5 border-info/20'
            : sale.status === 'CANCELLED'
            ? 'bg-danger/5 border-danger/20'
            : 'bg-muted/30 border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className={`h-6 w-6 ${
                sale.status === 'COMPLETED' ? 'text-success' :
                sale.status === 'REFUNDED' ? 'text-info' :
                'text-muted-foreground'
              }`} />
              <div>
                <p className="font-medium">Sale {statusInfo.label}</p>
                <p className="text-sm text-muted-foreground">{formatDate(sale.createdAt)}</p>
              </div>
            </div>
            <Badge variant={statusInfo.variant} size="lg">{statusInfo.label}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>{sale.items.length} item(s)</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Item</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Qty</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sale.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3">{item.quantity}</td>
                        <td className="text-right py-3">{formatCurrency(item.price)}</td>
                        <td className="text-right py-3 font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right py-2 text-muted-foreground">Subtotal</td>
                      <td className="text-right py-2">{formatCurrency(sale.subtotal)}</td>
                    </tr>
                    {sale.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="text-right py-2 text-muted-foreground">Discount</td>
                        <td className="text-right py-2 text-danger">-{formatCurrency(sale.discount)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="text-right py-2 font-medium">Total</td>
                      <td className="text-right py-2 font-bold text-lg text-primary">
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {sale.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{sale.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{sale.customer}</p>
                    <p className="text-xs text-muted-foreground">Walk-in Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <p className="text-sm font-medium">{sale.branch}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cashier</p>
                    <p className="text-sm font-medium">{sale.cashier}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sale.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payment records</p>
                ) : (
                  sale.payments.map((payment) => {
                    const Icon = paymentIcons[payment.method] || DollarSign
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{payment.method}</p>
                            {payment.referenceNumber && (
                              <p className="text-xs text-muted-foreground">
                                Ref: {payment.referenceNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    )
                  })
                )}

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Paid</span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(sale.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePrint}
                  disabled={exporting === 'print'}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {exporting === 'print' ? 'Printing...' : 'Print Invoice'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleExportJPEG}
                  disabled={exporting === 'jpeg'}
                >
                  <ImageDown className="h-4 w-4 mr-2" />
                  {exporting === 'jpeg' ? 'Exporting...' : 'Export as JPEG'}
                </Button>
                {sale.status === 'COMPLETED' && (
                  <Button
                    variant="outline"
                    className="w-full text-warning-600 hover:text-warning-600"
                    onClick={handleRefund}
                    disabled={exporting !== null}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refund
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden print templates */}
        <div style={{ position: 'absolute', left: '-9999px' }}>
          <div ref={receiptRef}>
            <ReceiptTemplate
              data={{
                invoiceNumber: sale.invoiceNumber,
                date: formatDate(sale.createdAt),
                time: new Date(sale.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                cashier: sale.cashier,
                branch: sale.branch,
                items: sale.items.map((item) => ({
                  sku: item.sku,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  subtotal: item.subtotal,
                })),
                subtotal: sale.subtotal,
                discount: sale.discount,
                total: sale.total,
                paymentMethod: sale.payments[0]?.method || 'Cash',
                cashReceived: sale.payments[0]?.amount || sale.total,
                change: (sale.payments[0]?.amount || sale.total) - sale.total,
                verifyUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/app/verify/${sale.invoiceNumber}`,
              }}
            />
          </div>
          <div ref={invoiceRef}>
            <InvoiceTemplate
              data={{
                invoiceNumber: sale.invoiceNumber,
                date: formatDate(sale.createdAt),
                time: new Date(sale.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                cashier: sale.cashier,
                branch: sale.branch,
                items: sale.items.map((item) => ({
                  sku: item.sku,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  subtotal: item.subtotal,
                })),
                subtotal: sale.subtotal,
                discount: sale.discount,
                total: sale.total,
                paymentMethod: sale.payments[0]?.method || 'Cash',
                cashReceived: sale.payments[0]?.amount || sale.total,
                change: (sale.payments[0]?.amount || sale.total) - sale.total,
                verifyUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/app/verify/${sale.invoiceNumber}`,
                customerName: sale.customer === 'Walk-in' ? undefined : sale.customer,
                paymentDetails: sale.payments.map((p) => ({
                  method: p.method,
                  amount: p.amount,
                })),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
