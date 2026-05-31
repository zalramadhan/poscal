'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const transactions = [
  { id: '1', type: 'income', description: 'Sales Revenue - POS', amount: 12500000, category: 'Sales', date: new Date().toISOString() },
  { id: '2', type: 'expense', description: 'Supplier Payment - PT Indofood', amount: 2500000, category: 'Inventory', date: new Date().toISOString() },
  { id: '3', type: 'expense', description: 'Electricity Bill', amount: 850000, category: 'Utilities', date: new Date().toISOString() },
  { id: '4', type: 'income', description: 'Sales Revenue - POS', amount: 9800000, category: 'Sales', date: new Date(Date.now() - 86400000).toISOString() },
]

export default function FinancePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [type, setType] = React.useState<'income' | 'expense'>('income')

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Income, expenses, and cash flow">
        <div className="flex gap-2">
          <Button onClick={() => { setType('income'); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />Add Income
          </Button>
          <Button variant="outline" onClick={() => { setType('expense'); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />Add Expense
          </Button>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-xl font-semibold text-success">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-danger/10">
                <TrendingDown className="h-6 w-6 text-danger" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-semibold text-danger">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                <p className="text-xl font-semibold">{formatCurrency(totalIncome - totalExpense)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}`}>
                    {t.type === 'income'
                      ? <ArrowUpRight className="h-4 w-4 text-success" />
                      : <ArrowDownRight className="h-4 w-4 text-danger" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" size="sm">{t.category}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                    </div>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{type === 'income' ? 'Add Income' : 'Add Expense'}</DialogTitle>
            <DialogDescription>Record a financial transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Description" placeholder="Transaction description" />
            <Input label="Amount" type="number" placeholder="0" />
            <Input label="Category" placeholder="e.g. Sales, Utilities, Inventory" />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
