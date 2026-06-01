'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, LoadingState } from '@/components/shared/page-states'
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface FinanceData {
  revenueToday: number
  salesToday: number
  recentSales: any[]
}

export default function FinanceReportPage() {
  const [data, setData] = React.useState<FinanceData | null>(null)
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

  if (loading) return <LoadingState message="Loading finance data..." />

  const stats = [
    { label: 'Total Income', value: formatCurrency(data?.revenueToday || 0), change: '', icon: TrendingUp, color: 'text-success bg-success/10' },
    { label: 'Total Transactions', value: (data?.salesToday || 0).toString(), change: '', icon: Wallet, color: 'text-primary bg-primary/10' },
    { label: 'Net Profit', value: formatCurrency(data?.revenueToday || 0), change: '', icon: TrendingDown, color: 'text-destructive bg-destructive/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/reports" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <PageHeader title="Finance Report" description="Income, expenses, and cash flow overview" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>This Month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.change && <p className="text-sm text-success mt-1">{stat.change}</p>}
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest income entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {(data?.recentSales || []).map((sale: any) => (
              <div key={sale.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{sale.invoiceNumber}</div>
                    <div className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-success">
                  +{formatCurrency(Number(sale.total))}
                </span>
              </div>
            ))}
            {(!data?.recentSales || data.recentSales.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
