'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
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
import type { DashboardSummary } from '@/types'

// Simulated data for development
const mockSummary: DashboardSummary = {
  revenueToday: 12500000,
  salesToday: 47,
  totalProducts: 156,
  lowStockCount: 8,
  totalCustomers: 89,
  recentSales: [],
  topProducts: [
    { id: '1', name: 'Indomie Goreng', totalSold: 234 },
    { id: '2', name: 'Aqua 600ml', totalSold: 189 },
    { id: '3', name: 'Kopiko 78g', totalSold: 145 },
    { id: '4', name: 'Teh Botol Sosro', totalSold: 112 },
    { id: '5', name: 'SilverQueen', totalSold: 98 },
  ],
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  trend?: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && (
            <span className="flex items-center text-xs text-success gap-0.5">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </span>
          )}
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
  const [loading] = React.useState(false)
  const [summary] = React.useState<DashboardSummary>(mockSummary)

  if (loading) return <LoadingState message="Loading dashboard..." />

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your business today" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue Today"
          value={formatCurrency(summary.revenueToday)}
          icon={DollarSign}
          trend="+12.5%"
          color="bg-success"
        />
        <StatCard
          title="Sales Today"
          value={summary.salesToday.toString()}
          icon={ShoppingCart}
          trend="+8.2%"
          color="bg-primary"
        />
        <StatCard
          title="Total Products"
          value={summary.totalProducts.toString()}
          icon={Package}
          color="bg-info"
        />
        <StatCard
          title="Low Stock Items"
          value={summary.lowStockCount.toString()}
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
            <div className="space-y-4">
              {summary.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${(product.totalSold / summary.topProducts[0].totalSold) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">{product.totalSold} sold</span>
                </div>
              ))}
            </div>
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
                <p className="text-xl font-semibold mt-1">{summary.totalCustomers}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-xl font-semibold mt-1">{summary.totalProducts}</p>
              </div>
              <div className="p-4 rounded-lg bg-danger/5">
                <p className="text-sm text-danger">Low Stock Alert</p>
                <p className="text-xl font-semibold mt-1 text-danger">{summary.lowStockCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-success/5">
                <p className="text-sm text-success">Sales Today</p>
                <p className="text-xl font-semibold mt-1 text-success">{summary.salesToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
