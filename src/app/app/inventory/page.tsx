'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { PackageSearch, AlertTriangle, Warehouse, ArrowUpDown } from 'lucide-react'

const mockInventoryItems = [
  { id: '1', product: { name: 'Indomie Goreng', sku: 'IND-001' }, warehouse: 'Gudang Utama', quantity: 500, sellingPrice: 3500 },
  { id: '2', product: { name: 'Aqua 600ml', sku: 'AQU-001' }, warehouse: 'Gudang Utama', quantity: 1000, sellingPrice: 3000 },
  { id: '3', product: { name: 'Kopiko 78g', sku: 'KOP-001' }, warehouse: 'Gudang Utama', quantity: 8, sellingPrice: 1500 },
  { id: '4', product: { name: 'Samsung TV 32"', sku: 'SAM-001' }, warehouse: 'Gudang Elektronik', quantity: 3, sellingPrice: 3500000 },
  { id: '5', product: { name: 'Teh Botol Sosro', sku: 'TBS-001' }, warehouse: 'Gudang Utama', quantity: 200, sellingPrice: 3500 },
]

export default function InventoryPage() {
  const [filter, setFilter] = React.useState<'all' | 'low'>('all')
  const items = filter === 'low' ? mockInventoryItems.filter((i) => i.quantity < 10) : mockInventoryItems

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
              <p className="text-xl font-semibold">156</p>
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
              <p className="text-xl font-semibold text-danger">8</p>
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
              <p className="text-xl font-semibold">3</p>
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
                {mockInventoryItems.filter((i) => i.quantity < 10).length > 0 && (
                  <Badge variant="danger" size="sm" className="ml-1">
                    {mockInventoryItems.filter((i) => i.quantity < 10).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">SKU</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Warehouse</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Quantity</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Value</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{item.product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.product.sku}</td>
                    <td className="px-4 py-3 text-sm">{item.warehouse}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{item.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.quantity * item.sellingPrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={item.quantity < 10 ? 'danger' : 'success'}>
                        {item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
