'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, Eye, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface OpnameItem {
  id: string
  warehouse: { id: string; name: string }
  status: string
  items: { id: string }[]
  notes: string | null
  createdAt: string
  createdBy: string
}

interface Warehouse {
  id: string
  name: string
}

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
  COMPLETED: 'success',
  APPROVED: 'info',
  SUBMITTED: 'info',
  DRAFT: 'default',
  REJECTED: 'warning',
}

export default function OpnamePage() {
  const [opnames, setOpnames] = React.useState<OpnameItem[]>([])
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showNewDialog, setShowNewDialog] = React.useState(false)
  const [showViewDialog, setShowViewDialog] = React.useState(false)
  const [selectedOpname, setSelectedOpname] = React.useState<OpnameItem | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => {
    fetchOpnames()
    fetchWarehouses()
  }, [])

  async function fetchOpnames() {
    try {
      const res = await fetch('/api/v1/inventory/opname')
      const data = await res.json()
      setOpnames(data.data?.data || [])
    } catch {
      setOpnames([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchWarehouses() {
    try {
      const res = await fetch('/api/v1/warehouses')
      const data = await res.json()
      setWarehouses(data.data || [])
    } catch {
      setWarehouses([])
    }
  }

  async function handleCreateOpname() {
    if (!selectedWarehouse) return
    setCreating(true)
    try {
      const res = await fetch('/api/v1/inventory/opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouseId: selectedWarehouse, notes }),
      })
      if (res.ok) {
        setShowNewDialog(false)
        setSelectedWarehouse('')
        setNotes('')
        fetchOpnames()
      }
    } finally {
      setCreating(false)
    }
  }

  async function handleViewOpname(opname: OpnameItem) {
    setSelectedOpname(opname)
    setShowViewDialog(true)
  }

  return (
    <div>
      <PageHeader title="Stock Opname" description="Physical stock counting">
        <Button onClick={() => setShowNewDialog(true)}><Plus className="h-4 w-4 mr-2" />New Opname</Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Opname History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : opnames.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No stock opnames found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Warehouse</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {opnames.map((opname) => (
                    <tr key={opname.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium">{opname.warehouse?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{opname.items?.length || 0}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant[opname.status] ?? 'default'}>{opname.status}</Badge></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(opname.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewOpname(opname)}>
                          <Eye className="h-4 w-4 mr-1" />View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Opname</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              label="Warehouse"
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              placeholder="Select warehouse"
            />
            <Input
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateOpname} disabled={!selectedWarehouse || creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start Opname
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Opname Details</DialogTitle>
          </DialogHeader>
          {selectedOpname && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Warehouse</p>
                  <p className="font-medium">{selectedOpname.warehouse?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={statusVariant[selectedOpname.status] ?? 'default'}>{selectedOpname.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="font-medium">{selectedOpname.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedOpname.createdAt)}</p>
                </div>
              </div>
              {selectedOpname.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedOpname.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}