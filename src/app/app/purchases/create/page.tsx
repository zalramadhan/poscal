'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { useFetch } from '@/hooks'
import type { Supplier, Warehouse, Product } from '@/types'

interface LineItem {
  productId: string
  quantity: string
  costPrice: string
}

interface FormErrors {
  supplierId?: string
  warehouseId?: string
  items?: string
}

function validateForm(supplierId: string, warehouseId: string, items: LineItem[]): FormErrors {
  const errors: FormErrors = {}
  if (!supplierId) errors.supplierId = 'Please select a supplier'
  if (!warehouseId) errors.warehouseId = 'Please select a warehouse'

  const validItems = items.filter((i) => i.productId)
  if (validItems.length === 0) {
    errors.items = 'At least one item with a product is required'
  } else {
    const incompleteItem = validItems.find((i) => !i.quantity || Number(i.quantity) <= 0)
    if (incompleteItem) errors.items = 'Each item must have a valid quantity'
  }

  return errors
}

export default function CreatePOPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  const [supplierId, setSupplierId] = React.useState('')
  const [warehouseId, setWarehouseId] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [items, setItems] = React.useState<LineItem[]>([{ productId: '', quantity: '', costPrice: '' }])

  const { data: suppliersData } = useFetch<Supplier[]>('/api/v1/suppliers')
  const { data: warehousesData } = useFetch<Warehouse[]>('/api/v1/warehouses')
  const { data: productsData } = useFetch<Product[]>('/api/v1/products')

  const suppliers = Array.isArray(suppliersData) ? suppliersData : []
  const warehouses = Array.isArray(warehousesData) ? warehousesData : []
  const products = Array.isArray(productsData) ? productsData : []

  function addItem() {
    setItems([...items, { productId: '', quantity: '', costPrice: '' }])
    if (errors.items && touched.items) {
      setErrors({ ...errors, items: undefined })
    }
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof LineItem, value: string) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
    if (touched.items) setErrors(validateForm(supplierId, warehouseId, newItems))
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors(validateForm(supplierId, warehouseId, items))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = validateForm(supplierId, warehouseId, items)
    setErrors(validation)
    setTouched({ supplierId: true, warehouseId: true, items: true })
    if (Object.keys(validation).length > 0) return

    setLoading(true)
    setError(null)

    try {
      const body = {
        supplierId,
        warehouseId,
        notes: notes || undefined,
        items: items
          .filter((item) => item.productId && Number(item.quantity) > 0)
          .map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            costPrice: Number(item.costPrice),
          })),
      }

      const res = await fetch('/api/v1/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        const errMsg = json.errors
          ? Object.values(json.errors).join(', ')
          : json.message || 'Failed to create purchase order'
        throw new Error(errMsg)
      }
      router.push('/app/purchases')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="New Purchase Order">
        <Link href="/app/purchases"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
      </PageHeader>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Purchase Order Details</CardTitle>
          <CardDescription>Create a new purchase order to restock inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Supplier *"
                placeholder="Select supplier"
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                value={supplierId}
                onChange={(e) => { setSupplierId(e.target.value); if (touched.supplierId) setErrors(validateForm(e.target.value, warehouseId, items)) }}
                onBlur={() => handleBlur('supplierId')}
                error={touched.supplierId ? errors.supplierId : undefined}
              />
              <Select
                label="Warehouse *"
                placeholder="Select warehouse"
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                value={warehouseId}
                onChange={(e) => { setWarehouseId(e.target.value); if (touched.warehouseId) setErrors(validateForm(supplierId, e.target.value, items)) }}
                onBlur={() => handleBlur('warehouseId')}
                error={touched.warehouseId ? errors.warehouseId : undefined}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Items *</h4>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />Add Item
                </Button>
              </div>
              {touched.items && errors.items && (
                <p className="text-xs text-danger">{errors.items}</p>
              )}
              {items.map((item, index) => (
                <div key={index} className="flex items-end gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <Select
                      label="Product"
                      placeholder="Select product"
                      options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      label="Qty"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label="Cost Price"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.costPrice}
                      onChange={(e) => updateItem(index, 'costPrice', e.target.value)}
                    />
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Notes (optional)</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/app/purchases"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Purchase Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
