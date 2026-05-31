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
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [warehouses, setWarehouses] = React.useState<Array<{id: string, name: string}>>([])
  const [products, setProducts] = React.useState<Array<{id: string, name: string}>>([])
  const [warehouseId, setWarehouseId] = React.useState('')
  const [items, setItems] = React.useState([{ productId: '', quantity: '', notes: '' }])

  React.useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [whRes, prodRes] = await Promise.all([
        fetch('/api/v1/warehouses'),
        fetch('/api/v1/products'),
      ])

      if (whRes.ok) {
        const whData = await whRes.json()
        setWarehouses(whData.data || [])
        if (whData.data?.length > 0) {
          setWarehouseId(whData.data[0].id)
        }
      }
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

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

  async function handleSubmit() {
    if (!warehouseId || items.length === 0) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      for (const item of items) {
        if (!item.productId || !item.quantity) continue

        const res = await fetch('/api/v1/inventory?action=stock-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            warehouseId,
            productId: item.productId,
            quantity: Number(item.quantity),
            notes: item.notes,
          }),
        })

        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.message || 'Failed to save')
        }
      }

      // Reset form
      setItems([{ productId: '', quantity: '', notes: '' }])
      alert('Stock in successful!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
          {error && (
            <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <Select
            label="Warehouse"
            placeholder="Select destination warehouse"
            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
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
                    options={products.map(p => ({ value: p.id, label: p.name }))}
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
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Stock In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
