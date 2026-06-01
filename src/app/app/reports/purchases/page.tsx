'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Download, Package, TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PurchaseOrder {
  id: string
  code: string
  supplier: { name: string }
  warehouse: { name: string }
  total: number
  status: string
  createdAt: string
}

interface Summary {
  totalOrders: number
  totalSpent: number
}

export default function PurchaseReportPage() {
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([])
  const [summary, setSummary] = React.useState<Summary>({ totalOrders: 0, totalSpent: 0 })

  React.useEffect(() => {
    fetch('/api/v1/reports/purchases')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.data?.orders || [])
        setSummary(data.data?.summary || { totalOrders: 0, totalSpent: 0 })
      })
  }, [])

  const avgPOValue = summary.totalOrders > 0 ? summary.totalSpent / summary.totalOrders : 0

  return (
    <div className="space-y-6">
      <PageHeader title="Purchase Report" description="Purchase analytics and supplier data">
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total POs</p>
                <p className="text-2xl font-semibold mt-1">{summary.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(summary.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg PO Value</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(avgPOValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.map((po) => (
              <div key={po.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div>
                  <p className="font-medium">{po.code}</p>
                  <p className="text-sm text-muted-foreground">{po.supplier?.name || '-'} • {po.warehouse?.name || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(po.total)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(po.createdAt)}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No purchase orders yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
