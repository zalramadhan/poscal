'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'
import Link from 'next/link'

const stats = [
  { label: 'Total Income', value: 'Rp 85.250.000', change: '+12.5%', icon: TrendingUp, color: 'text-success bg-success/10' },
  { label: 'Total Expenses', value: 'Rp 32.180.000', change: '+8.3%', icon: TrendingDown, color: 'text-destructive bg-destructive/10' },
  { label: 'Net Profit', value: 'Rp 53.070.000', change: '+15.2%', icon: Wallet, color: 'text-primary bg-primary/10' },
]

const recentTransactions = [
  { date: '2026-05-31', description: 'Sales Revenue - Cabang Pusat', type: 'Income', amount: '+Rp 12.500.000' },
  { date: '2026-05-31', description: 'Utility Bill Payment', type: 'Expense', amount: '-Rp 2.300.000' },
  { date: '2026-05-30', description: 'Sales Revenue - Cabang Surabaya', type: 'Income', amount: '+Rp 8.750.000' },
  { date: '2026-05-30', description: 'Supplier Payment - PT Indofood', type: 'Expense', amount: '-Rp 5.600.000' },
  { date: '2026-05-29', description: 'Sales Revenue - Cabang Jakarta', type: 'Income', amount: '+Rp 9.200.000' },
  { date: '2026-05-29', description: 'Office Supplies', type: 'Expense', amount: '-Rp 850.000' },
  { date: '2026-05-28', description: 'Sales Revenue - Cabang Pusat', type: 'Income', amount: '+Rp 11.300.000' },
]

export default function FinanceReportPage() {
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
                  <p className="text-sm text-success mt-1">{stat.change} vs last month</p>
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
          <CardDescription>Latest income and expense entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {recentTransactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'Income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {tx.type === 'Income' ? (
                      <TrendingUp className={`h-4 w-4 ${tx.type === 'Income' ? 'text-success' : 'text-destructive'}`} />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{tx.description}</div>
                    <div className="text-xs text-muted-foreground">{tx.date}</div>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'Income' ? 'text-success' : 'text-destructive'}`}>
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
