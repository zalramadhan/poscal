'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SalesData {
  revenueToday: number
  salesToday: number
}

export default function SalesReportPage() {
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [data, setData] = React.useState<SalesData | null>(null)
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

  if (loading) return <LoadingState message="Loading sales data..." />

  const avgOrderValue = data?.salesToday ? data.revenueToday / data.salesToday : 0

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Report" description="Sales analytics and revenue data">
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(data?.revenueToday || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-semibold mt-1">{data?.salesToday || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Average Order Value</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(avgOrderValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Revenue chart will be displayed here (Recharts integration)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
