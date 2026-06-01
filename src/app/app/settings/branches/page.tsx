'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, ArrowLeft, Building2, MapPin, Phone, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'

interface BranchItem {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  isActive: boolean
}

export default function BranchesSettingsPage() {
  const [branches, setBranches] = React.useState<BranchItem[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editBranch, setEditBranch] = React.useState<BranchItem | null>(null)
  const [formData, setFormData] = React.useState({ name: '', code: '', address: '', phone: '' })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetchBranches()
  }, [])

  function fetchBranches() {
    fetch('/api/v1/settings?section=branches')
      .then((res) => res.json())
      .then((data) => setBranches(data.data || []))
  }

  function openAddDialog() {
    setEditBranch(null)
    setFormData({ name: '', code: '', address: '', phone: '' })
    setDialogOpen(true)
  }

  function openEditDialog(branch: BranchItem) {
    setEditBranch(branch)
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone || '',
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!formData.name || !formData.code) return
    setSaving(true)

    const url = editBranch
      ? `/api/v1/branches?id=${editBranch.id}`
      : '/api/v1/settings?section=branches'
    const method = editBranch ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.ok) {
          setDialogOpen(false)
          fetchBranches()
        }
      })
      .finally(() => setSaving(false))
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete branch "${name}"?`)) return
    fetch(`/api/v1/branches?id=${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete')
        fetchBranches()
      })
      .catch(() => alert('Failed to delete branch'))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <PageHeader title="Branches" description="Manage your business branches" />
        </div>
        <Button onClick={openAddDialog}><Plus className="h-4 w-4 mr-2" />Add Branch</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card key={branch.id} className="hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                    <CardDescription>Code: {branch.code}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={branch.isActive ? 'success' : 'outline'}>{branch.isActive ? 'Active' : 'Inactive'}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(branch)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(branch.id, branch.name)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {branch.address || '-'}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {branch.phone || '-'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editBranch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
            <DialogDescription>{editBranch ? 'Update branch information' : 'Create a new branch'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Branch Name" placeholder="Enter branch name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Branch Code" placeholder="e.g. MAIN" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            <Input label="Address" placeholder="Enter address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            <Input label="Phone" placeholder="Enter phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !formData.name || !formData.code}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
