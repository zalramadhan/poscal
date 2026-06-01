'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowUpRight,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className={`p-2 rounded-lg ${color} w-fit`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className={`p-2 rounded-lg bg-warning w-fit`}>
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Shifts Today</p>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Open</span>
                  <span className="font-medium">{shifts.open}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending Approval</span>
                  <span className="font-medium text-yellow-600">{shifts.pending}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/app/shifts">View All Shifts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
              <Link href="/app/reports/inventory">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View Report
                </Button>
              </Link>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-semibold mt-1">
                {(lowStock.critical.length + lowStock.warning.length) || summary.lowStockCount || 0}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-danger">
                  <XCircle className="h-3 w-3" />
                  {lowStock.critical.length} critical
                </span>
                <span className="flex items-center gap-1 text-xs text-warning">
                  <AlertCircle className="h-3 w-3" />
                  {lowStock.warning.length} warning
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topProducts && summary.topProducts.length > 0 ? (
              <div className="space-y-4">
                {summary.topProducts.map((product: any, index: number) => (
                  <div key={product.id || index} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${(product.totalSold / (summary.topProducts[0]?.totalSold || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium">{product.totalSold} sold</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-xl font-semibold mt-1">{summary.totalCustomers || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-xl font-semibold mt-1">{summary.totalProducts || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-danger/5 border border-danger/20">
                <p className="text-sm text-danger font-medium">Critical Stock</p>
                <p className="text-xl font-semibold mt-1 text-danger">{lowStock.critical.length}</p>
                <p className="text-xs text-muted-foreground mt-1">items out of stock</p>
              </div>
              <div className="p-4 rounded-lg bg-success/5">
                <p className="text-sm text-success">Sales Today</p>
                <p className="text-xl font-semibold mt-1 text-success">{summary.salesToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
