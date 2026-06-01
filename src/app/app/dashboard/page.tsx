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
  )
}

interface LowStockData {
  critical: any[]
  warning: any[]
  all: any[]
}

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true)
  const [summary, setSummary] = React.useState<any>({
    revenueToday: 0,
    salesToday: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    recentSales: [],
    topProducts: [],
  })
  const [lowStock, setLowStock] = React.useState<LowStockData>({ critical: [], warning: [], all: [] })

  React.useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const [dashboardRes, lowStockRes] = await Promise.all([
        fetch('/api/v1/dashboard'),
        fetch('/api/v1/reports/inventory/low-stock'),
      ])

      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setSummary(data.data || summary)
      }

      if (lowStockRes.ok) {
        const data = await lowStockRes.json()
        setLowStock(data.data || { critical: [], warning: [], all: [] })
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState message="Loading dashboard..." />

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your business today" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue Today"
          value={formatCurrency(summary.revenueToday || 0)}
          icon={DollarSign}
          color="bg-success"
        />
        <StatCard
          title="Sales Today"
          value={(summary.salesToday || 0).toString()}
          icon={ShoppingCart}
          color="bg-primary"
        />
        <StatCard
          title="Total Products"
          value={(summary.totalProducts || 0).toString()}
          icon={Package}
          color="bg-info"
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg bg-danger w-fit`}>
                <AlertTriangle className="h-5 w-5 text-white" />
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
