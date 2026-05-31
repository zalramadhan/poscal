'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'

const mockBrands = [
  { id: '1', name: 'Indomie', description: 'Mie instan', productCount: 15 },
  { id: '2', name: 'Aqua', description: 'Air mineral', productCount: 8 },
  { id: '3', name: 'Kopiko', description: 'Permen kopi', productCount: 5 },
  { id: '4', name: 'Samsung', description: 'Elektronik', productCount: 12 },
  { id: '5', name: 'LG', description: 'Elektronik rumah tangga', productCount: 10 },
]

export default function BrandsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <div>
      <PageHeader title="Brands" description="Manage product brands">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockBrands.map((brand) => (
          <Card key={brand.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{brand.name}</h3>
                  <p className="text-sm text-muted-foreground">{brand.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <Badge variant="outline">{brand.productCount} products</Badge>
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
            <DialogTitle>Add Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Brand Name" placeholder="Enter brand name" />
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
