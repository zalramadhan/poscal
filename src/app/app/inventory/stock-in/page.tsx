'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'

export default function StockInPage() {
  const [items, setItems] = React.useState([{ productId: '', quantity: '', notes: '' }])
  const [warehouseId, setWarehouseId] = React.useState('')

  function addItem() {
    setItems([...items, { productId: '', quantity: '', notes: '' }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: string) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  return (
    <div>
      <PageHeader title="Stock In" description="Add stock to warehouse">
        <Link href="/app/inventory">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Receive Stock</CardTitle>
          <CardDescription>Record incoming stock to a warehouse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
            label="Warehouse"
            placeholder="Select destination warehouse"
            options={[
              { value: '1', label: 'Gudang Utama' },
              { value: '2', label: 'Gudang Surabaya' },
              { value: '3', label: 'Gudang Jakarta' },
            ]}
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Items</h4>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex-1">
                  <Select
                    label="Product"
                    placeholder="Select product"
                    options={[
                      { value: '1', label: 'Indomie Goreng' },
                      { value: '2', label: 'Aqua 600ml' },
                      { value: '3', label: 'Kopiko 78g' },
                    ]}
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    label="Qty"
                    type="number"
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Notes"
                    placeholder="Optional"
                    value={item.notes}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                  />
                </div>
                {items.length > 1 && (
                  <Button variant="ghost" size="sm" className="mb-0.5" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/app/inventory">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Stock In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
