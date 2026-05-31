'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, Truck, Package, FileText, Pencil } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useFetch } from '@/hooks'
import type { PurchaseOrder } from '@/types'

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  DRAFT: { variant: 'default', label: 'Draft' },
  APPROVED: { variant: 'info', label: 'Approved' },
  ORDERED: { variant: 'warning', label: 'Ordered' },
  RECEIVED: { variant: 'success', label: 'Received' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
}

export default function PurchaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: po, loading, error, refetch } = useFetch<PurchaseOrder>(`/api/v1/purchase-orders/${id}`)

  if (loading) return <LoadingState message="Loading purchase order..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />
  if (!po) return <ErrorState title="Not Found" message="Purchase order not found" onRetry={() => router.refresh()} />

  const statusInfo = statusConfig[po.status] || { variant: 'default' as const, label: po.status }

  return (
    <div>
      <PageHeader title={`PO #${po.poNumber}`}>
        <div className="flex items-center gap-2">
          <Link href={`/app/purchases/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href="/app/purchases">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Status Banner */}
      <div className="mb-6 p-4 rounded-lg border bg-muted/30 border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-medium">Status: {statusInfo.label}</p>
              <p className="text-sm text-muted-foreground">{formatDate(po.createdAt)}</p>
            </div>
          </div>
          <Badge variant={statusInfo.variant} size="lg">{statusInfo.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{(po as any).items?.length || 0} item(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground">Product</th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Cost Price</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(po as any).items?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{item.product?.name || 'Unknown'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.product?.sku || ''}</p>
                      </td>
                      <td className="text-center py-3">{Number(item.quantity)}</td>
                      <td className="text-right py-3">{formatCurrency(Number(item.costPrice))}</td>
                      <td className="text-right py-3 font-medium">{formatCurrency(Number(item.subtotal))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right py-2 text-muted-foreground">Subtotal</td>
                    <td className="text-right py-2">{formatCurrency(po.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="text-right py-2 font-medium">Total</td>
                    <td className="text-right py-2 font-bold text-lg text-primary">
                      {formatCurrency(po.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{po.supplier?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{po.warehouse?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {po.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{po.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/app/purchases')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
