'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'

export default function BrandsPage() {
  const [brands, setBrands] = React.useState<Array<{id: string, name: string, description?: string}>>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')

  React.useEffect(() => {
    fetchBrands()
  }, [])

  async function fetchBrands() {
    try {
      const res = await fetch('/api/v1/brands')
      if (res.ok) {
        const data = await res.json()
        setBrands(data.data || [])
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
      const res = await fetch('/api/v1/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (res.ok) {
        setName('')
        setDescription('')
        setDialogOpen(false)
        fetchBrands()
      }
    } catch (err) {
      console.error('Failed to create:', err)
    }
  }

  return (
    <div>
      <PageHeader title="Brands" description="Manage product brands">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No brands found</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first brand</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{brand.name}</h3>
                    <p className="text-sm text-muted-foreground">{brand.description || '-'}</p>
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
            <DialogTitle>Add Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Brand Name" placeholder="Enter brand name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Description" placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} />
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
