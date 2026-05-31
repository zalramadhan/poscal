'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Package } from 'lucide-react'

const mockCategories = [
  { id: '1', name: 'Makanan', description: 'Makanan ringan dan berat', productCount: 45 },
  { id: '2', name: 'Minuman', description: 'Minuman kemasan dan botol', productCount: 32 },
  { id: '3', name: 'Elektronik', description: 'Barang elektronik', productCount: 12 },
  { id: '4', name: 'Fashion', description: 'Pakaian dan aksesoris', productCount: 28 },
  { id: '5', name: 'Kebutuhan Rumah', description: 'Perlengkapan rumah tangga', productCount: 39 },
]

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <div>
      <PageHeader title="Categories" description="Manage product categories">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCategories.map((cat) => (
          <Card key={cat.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <Badge variant="outline">{cat.productCount} products</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-danger"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Category Name" placeholder="Enter category name" />
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
              <textarea className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm min-h-[80px]" placeholder="Optional description" />
            </div>
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
