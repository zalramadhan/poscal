'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Package, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface InventoryData {
  totalProducts: number
  lowStockCount: number
  topProducts: any[]
}

export default function InventoryReportPage() {
  const [data, setData] = React.useState<InventoryData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/v1/dashboard')
      .then(res => res.json())
      .then(json => {
        setData(json.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState message="Loading inventory data..." />

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Report" description="Stock analysis and valuation">
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-semibold mt-1">{data?.totalProducts || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Stock Value</p>
            <p className="text-2xl font-semibold mt-1">-</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-danger">Low Stock Items</p>
            <p className="text-2xl font-semibold mt-1 text-danger">{data?.lowStockCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(data?.topProducts || []).map((product: any) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{product.totalSold} sold</p>
                </div>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
