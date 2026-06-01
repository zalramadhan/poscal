'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Building2, Clock, DollarSign, CreditCard, QrCode, AlertTriangle, Check, Receipt } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ShiftSales {
  id: string
  invoiceNumber: string
  total: number
  status: string
  createdAt: string
  payments: Array<{
    id: string
    amount: number
    paymentMethod: { name: string }
  }>
}

interface ShiftDetail {
  id: string
  status: 'OPEN' | 'PENDING_APPROVAL' | 'CLOSED'
  openingCash: number
  closingCash: number | null
  expectedCash: number | null
  variance: number | null
  openedAt: string
  closedAt: string | null
  user: { id: string; name: string; email: string }
  branch: { id: string; name: string }
  sales: ShiftSales[]
}

interface ShiftReport {
  shift: {
    id: string
    status: string
    openingCash: number
    closingCash: number | null
    expectedCash: number | null
    variance: number | null
    openedAt: string
    closedAt: string | null
    user: { id: string; name: string }
    branch: { id: string; name: string }
  }
  sales: {
    totalCount: number
    totalRevenue: number
    byPaymentMethod: Record<string, { count: number; total: number }>
    refunds: { count: number; total: number }
  }
  duration: string
}

const statusColors = {
  OPEN: 'success',
  PENDING_APPROVAL: 'warning',
  CLOSED: 'secondary',
} as const

export default function ShiftDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [shift, setShift] = React.useState<ShiftDetail | null>(null)
  const [report, setReport] = React.useState<ShiftReport | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [approving, setApproving] = React.useState(false)

  const fetchShift = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/cashier/shifts/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load shift')
      setShift(data.data)
    } catch (err: any) {
      setError(err.message)
    }
  }, [id])

  const fetchReport = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/cashier/shifts/${id}/report`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load report')
      setReport(data.data)
    } catch (err: any) {
      console.error('Report error:', err)
    }
  }, [id])

  React.useEffect(() => {
    Promise.all([fetchShift(), fetchReport()])
      .finally(() => setLoading(false))
  }, [fetchShift, fetchReport])

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this shift?')) return
    setApproving(true)
    try {
      const res = await fetch(`/api/v1/cashier/shifts/${id}?action=approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to approve shift')
      router.refresh()
      await fetchShift()
      await fetchReport()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setApproving(false)
    }
  }

  if (loading) return <LoadingState message="Loading shift..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={fetchShift} />
  if (!shift) return <ErrorState title="Not Found" message="Shift not found" onRetry={() => router.refresh()} />

  const completedSales = shift.sales.filter((s) => s.status === 'COMPLETED')

  return (
    <div>
      <PageHeader title={`Shift - ${formatDate(shift.openedAt)}`}>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[shift.status]} size="lg">
            {shift.status.replace('_', ' ')}
          </Badge>
          <Link href="/app/shifts">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </PageHeader>

      {shift.status === 'PENDING_APPROVAL' && (
        <Card className="mb-6 border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <div>
                  <p className="font-medium text-warning">Variance Detected</p>
                  <p className="text-sm text-muted-foreground">
                    Expected cash: {formatCurrency(shift.expectedCash || 0)} | Actual: {formatCurrency(shift.closingCash || 0)} | Variance: {formatCurrency(shift.variance || 0)}
                  </p>
                </div>
              </div>
              <Button onClick={handleApprove} disabled={approving} variant="warning">
                <Check className="h-4 w-4 mr-2" />
                {approving ? 'Approving...' : 'Approve Shift'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales During Shift</CardTitle>
              <CardDescription>{report?.sales.totalCount || 0} sale(s) | Total: {formatCurrency(report?.sales.totalRevenue || 0)}</CardDescription>
            </CardHeader>
            <CardContent>
              {completedSales.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sales during this shift</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Invoice</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Time</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Total</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {completedSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-muted/20">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-mono text-xs">{sale.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">{formatDate(sale.createdAt)}</td>
                        <td className="text-right py-3 font-medium">{formatCurrency(sale.total)}</td>
                        <td className="text-right py-3">
                          <span className="text-muted-foreground">
                            {sale.payments.map((p) => p.paymentMethod.name).join(', ') || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shift Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cashier</p>
                  <p className="text-sm font-medium">{shift.user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Branch</p>
                  <p className="text-sm font-medium">{shift.branch.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium">{report?.duration || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cash Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Opening Cash</span>
                <span className="font-medium">{formatCurrency(shift.openingCash)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected Cash</span>
                <span className="font-medium">{formatCurrency(shift.expectedCash ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Closing Cash</span>
                <span className="font-medium">{formatCurrency(shift.closingCash ?? 0)}</span>
              </div>
              {shift.variance !== null && (
                <div className={`flex justify-between text-sm pt-2 border-t border-border ${shift.variance === 0 ? 'text-success' : 'text-danger'}`}>
                  <span className="font-medium">Variance</span>
                  <span className="font-bold">{formatCurrency(shift.variance)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report?.sales.byPaymentMethod && Object.entries(report.sales.byPaymentMethod).length > 0 ? (
                Object.entries(report.sales.byPaymentMethod).map(([method, data]) => (
                  <div key={method} className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      method.toLowerCase().includes('cash') ? 'bg-success/10' :
                      method.toLowerCase().includes('qr') ? 'bg-info/10' :
                      'bg-primary/10'
                    }`}>
                      {method.toLowerCase().includes('cash') ? (
                        <DollarSign className="h-5 w-5 text-success" />
                      ) : method.toLowerCase().includes('qr') ? (
                        <QrCode className="h-5 w-5 text-info" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">{method}</p>
                      <p className="text-xs text-muted-foreground">{data.count} transaction(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(data.total)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No payment data</p>
              )}
            </CardContent>
          </Card>

          {report?.sales.refunds && report.sales.refunds.count > 0 && (
            <Card className="border-danger/30">
              <CardHeader>
                <CardTitle className="text-base text-danger">Refunds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Count</span>
                  <span className="font-medium">{report.sales.refunds.count}</span>
                </div>
                <div className="flex justify-between text-sm text-danger">
                  <span className="font-medium">Total Refunded</span>
                  <span className="font-bold">{formatCurrency(report.sales.refunds.total)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
