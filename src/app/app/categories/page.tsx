'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Package } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Array<{id: string, name: string, description?: string}>>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')

  React.useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/v1/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!name) return
    try {
      const res = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (res.ok) {
        setName('')
        setDescription('')
        setDialogOpen(false)
        fetchCategories()
      }
    } catch (err) {
      console.error('Failed to create:', err)
    }
  }

  return (
    <div>
      <PageHeader title="Categories" description="Manage product categories">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No categories found</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first category</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.description || '-'}</p>
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
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Category Name" placeholder="Enter category name" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
              <textarea className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm min-h-[80px]" placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
