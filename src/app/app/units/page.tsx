'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Scale } from 'lucide-react'

export default function UnitsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [units, setUnits] = React.useState<Array<{id: string, name: string, symbol: string}>>([])
  const [loading, setLoading] = React.useState(true)
  const [name, setName] = React.useState('')
  const [symbol, setSymbol] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/v1/units')
      if (res.ok) {
        const data = await res.json()
        setUnits(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch units:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!name || !symbol) return
    setSaving(true)
    try {
      const res = await fetch('/api/v1/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, symbol }),
      })
      if (res.ok) {
        setName('')
        setSymbol('')
        setDialogOpen(false)
        fetchUnits()
      }
    } catch (error) {
      console.error('Failed to create unit:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Units" description="Manage product units">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : units.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Scale className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No units found</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first unit to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {units.map((unit) => (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{unit.name}</h3>
                      <p className="text-sm text-muted-foreground">Symbol: {unit.symbol}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4 pt-3 border-t border-border">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-danger"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Unit</DialogTitle>
            <DialogDescription>Create a new product unit (e.g., pcs, kg, liter)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Unit Name" placeholder="e.g., Pieces" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Symbol" placeholder="e.g., pcs" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !name || !symbol}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
