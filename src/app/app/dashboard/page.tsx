'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState } from '@/components/shared/page-states'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowUpRight,
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

  React.useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/v1/dashboard')
      if (res.ok) {
        const data = await res.json()
        console.log('[Dashboard] Response:', JSON.stringify(data))
        console.log('[Dashboard] topProducts:', JSON.stringify(data.data?.topProducts))
        setSummary(data.data || summary)
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
        <StatCard
          title="Low Stock Items"
          value={(summary.lowStockCount || 0).toString()}
          icon={AlertTriangle}
          color="bg-danger"
        />
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
              <div className="p-4 rounded-lg bg-danger/5">
                <p className="text-sm text-danger">Low Stock Alert</p>
                <p className="text-xl font-semibold mt-1 text-danger">{summary.lowStockCount || 0}</p>
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
