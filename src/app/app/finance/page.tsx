'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  date: string
}

interface Summary {
  totalIncome: number
  totalExpense: number
  netProfit: number
}

export default function FinancePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [type, setType] = React.useState<'income' | 'expense'>('income')
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [summary, setSummary] = React.useState<Summary>({ totalIncome: 0, totalExpense: 0, netProfit: 0 })
  const [description, setDescription] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetchTransactions()
  }, [])

  function fetchTransactions() {
    fetch('/api/v1/finance?section=transactions')
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.data?.transactions || [])
        setSummary({
          totalIncome: data.data?.totalIncome || 0,
          totalExpense: data.data?.totalExpense || 0,
          netProfit: (data.data?.totalIncome || 0) - (data.data?.totalExpense || 0),
        })
      })
  }

  function openDialog(t: 'income' | 'expense') {
    setType(t)
    setDescription('')
    setAmount('')
    setCategory('')
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount) return

    setSaving(true)
    try {
      const res = await fetch(`/api/v1/finance?type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount: Number(amount), category }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setDialogOpen(false)
      fetchTransactions()
    } catch {
      alert('Failed to save transaction')
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(id: string, t: string) {
    if (!confirm('Delete this transaction?')) return
    fetch(`/api/v1/finance/${id}?type=${t}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete')
        fetchTransactions()
      })
      .catch(() => alert('Failed to delete transaction'))
  }

  const totalIncome = summary.totalIncome
  const totalExpense = summary.totalExpense

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Income, expenses, and cash flow">
        <div className="flex gap-2">
          <Button onClick={() => openDialog('income')}>
            <Plus className="h-4 w-4 mr-2" />Add Income
          </Button>
          <Button variant="outline" onClick={() => openDialog('expense')}>
            <Plus className="h-4 w-4 mr-2" />Add Expense
          </Button>
        </div>
      </PageHeader>

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
                <p className="text-xl font-semibold">{formatCurrency(summary.netProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id, t.type)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{type === 'income' ? 'Add Income' : 'Add Expense'}</DialogTitle>
            <DialogDescription>Record a financial transaction</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <Input
              label="Description"
              placeholder="Transaction description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Input
              label="Amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input
              label="Category"
              placeholder="e.g. Sales, Utilities, Inventory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
