'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Package, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const lowStockItems = [
  { name: 'Kopiko 78g', sku: 'KOP-001', currentStock: 8, minStock: 10, warehouse: 'Gudang Utama' },
  { name: 'Samsung TV 32"', sku: 'SAM-001', currentStock: 3, minStock: 5, warehouse: 'Gudang Elektronik' },
]

const categorySummary = [
  { category: 'Makanan', totalItems: 65, totalValue: 32500000 },
  { category: 'Minuman', totalItems: 48, totalValue: 14400000 },
  { category: 'Elektronik', totalItems: 23, totalValue: 115000000 },
  { category: 'Fashion', totalItems: 12, totalValue: 3600000 },
  { category: 'Kebutuhan Rumah', totalItems: 8, totalValue: 1600000 },
]

export default function InventoryReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Report" description="Stock analysis and valuation">
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-2xl font-semibold mt-1">156</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Stock Value</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(167100000)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-danger">Low Stock Items</p>
            <p className="text-2xl font-semibold mt-1 text-danger">8</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.sku} className="flex items-center justify-between p-3 rounded-lg bg-danger/5">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.sku} - {item.warehouse}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-danger">{item.currentStock} left</p>
                  <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Stock by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Total Items</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Total Value</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categorySummary.map((cat) => {
                  const totalValue = categorySummary.reduce((sum, c) => sum + c.totalValue, 0)
                  const pct = ((cat.totalValue / totalValue) * 100).toFixed(1)
                  return (
                    <tr key={cat.category} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium">{cat.category}</td>
                      <td className="px-4 py-3 text-sm text-right">{cat.totalItems}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(cat.totalValue)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{pct}%</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
