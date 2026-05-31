'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { PackageSearch, AlertTriangle, Warehouse } from 'lucide-react'

export default function InventoryPage() {
  const [balances, setBalances] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<'all' | 'low'>('all')

  React.useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    try {
      const res = await fetch('/api/v1/inventory/balances')
      if (res.ok) {
        const data = await res.json()
        setBalances(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  const lowStockItems = balances.filter((b) => (b.quantity || 0) < 10)
  const items = filter === 'low' ? lowStockItems : balances

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Manage stock across warehouses">
        <div className="flex gap-2">
          <Link href="/app/inventory/stock-in">
            <Button variant="outline" size="sm">Stock In</Button>
          </Link>
          <Link href="/app/inventory/stock-out">
            <Button variant="outline" size="sm">Stock Out</Button>
          </Link>
          <Link href="/app/inventory/adjustment">
            <Button variant="outline" size="sm">Adjustment</Button>
          </Link>
          <Link href="/app/inventory/opname">
            <Button variant="outline" size="sm">Opname</Button>
          </Link>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <PackageSearch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-semibold">{balances.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-danger/10">
              <AlertTriangle className="h-6 w-6 text-danger" />
            </div>
            <div>
              <p className="text-sm text-danger">Low Stock Items</p>
              <p className="text-xl font-semibold text-danger">{lowStockItems.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-info/10">
              <Warehouse className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warehouses</p>
              <p className="text-xl font-semibold">1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock List</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All Items
              </Button>
              <Button
                size="sm"
                variant={filter === 'low' ? 'default' : 'outline'}
                onClick={() => setFilter('low')}
                className="relative"
              >
                Low Stock
                {lowStockItems.length > 0 && (
                  <Badge variant="danger" size="sm" className="ml-1">
                    {lowStockItems.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <PackageSearch className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No inventory data</p>
              <p className="text-xs text-muted-foreground">Do Stock In to add inventory</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Product</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">SKU</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Warehouse</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{item.product?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.product?.sku || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.warehouse?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{Number(item.quantity || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
