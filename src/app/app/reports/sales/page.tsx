'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function SalesReportPage() {
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Report" description="Sales analytics and revenue data">
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Input type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <Button variant="secondary" className="mt-6">Apply</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(12500000)}</p>
            <p className="text-xs text-success mt-1">+12.5% vs last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-semibold mt-1">47</p>
            <p className="text-xs text-success mt-1">+8.2% vs last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Average Order Value</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(265957)}</p>
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
