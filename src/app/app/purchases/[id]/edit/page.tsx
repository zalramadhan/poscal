'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { useFetch } from '@/hooks'
import type { PurchaseOrder, Supplier, Warehouse, Product } from '@/types'

interface LineItem {
  productId: string
  quantity: string
  costPrice: string
  id?: string
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
  if (validItems.length === 0) errors.items = 'At least one item with a product is required'
  return errors
}

export default function EditPOPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: po, loading, error, refetch } = useFetch<PurchaseOrder>(`/api/v1/purchase-orders/${id}`)
  const { data: suppliersData } = useFetch<Supplier[]>('/api/v1/suppliers')
  const { data: warehousesData } = useFetch<Warehouse[]>('/api/v1/warehouses')
  const { data: productsData } = useFetch<Product[]>('/api/v1/products')

  const [saving, setSaving] = React.useState(false)
  const [fetchError, setFetchError] = React.useState<string | null>(null)
  const [supplierId, setSupplierId] = React.useState('')
  const [warehouseId, setWarehouseId] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [items, setItems] = React.useState<LineItem[]>([])
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  const suppliers = Array.isArray(suppliersData) ? suppliersData : []
  const warehouses = Array.isArray(warehousesData) ? warehousesData : []
  const products = Array.isArray(productsData) ? productsData : []

  React.useEffect(() => {
    if (!po) return
    const p = po as any
    setSupplierId(p.supplierId || '')
    setWarehouseId(p.warehouseId || '')
    setNotes(p.notes || '')
    setItems(
      (p.items || []).map((item: any) => ({
        id: item.id,
        productId: item.productId || '',
        quantity: String(item.quantity ?? ''),
        costPrice: String(item.costPrice ?? ''),
      }))
    )
  }, [po])

  function addItem() { setItems([...items, { productId: '', quantity: '', costPrice: '' }]) }
  function removeItem(index: number) { setItems(items.filter((_, i) => i !== index)) }
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

    setSaving(true)
    setFetchError(null)

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

      const res = await fetch(`/api/v1/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        const errMsg = json.errors ? Object.values(json.errors).join(', ') : json.message || 'Failed to update PO'
        throw new Error(errMsg)
      }
      router.push(`/app/purchases/${id}`)
      router.refresh()
    } catch (err: any) {
      setFetchError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Loading purchase order..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />
  if (!po) return <ErrorState title="Not Found" message="Purchase order not found" onRetry={() => router.refresh()} />

  return (
    <div>
      <PageHeader title={`Edit PO: ${(po as any).poNumber || ''}`}>
        <Link href={`/app/purchases/${id}`}>
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
      </PageHeader>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Purchase Order Details</CardTitle>
          <CardDescription>Edit purchase order #{id.slice(0, 8)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {fetchError && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-sm text-danger">{fetchError}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Select label="Supplier *" placeholder="Select supplier" options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                value={supplierId}
                onChange={(e) => { setSupplierId(e.target.value); if (touched.supplierId) setErrors(validateForm(e.target.value, warehouseId, items)) }}
                onBlur={() => handleBlur('supplierId')}
                error={touched.supplierId ? errors.supplierId : undefined} />
              <Select label="Warehouse *" placeholder="Select warehouse" options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                value={warehouseId}
                onChange={(e) => { setWarehouseId(e.target.value); if (touched.warehouseId) setErrors(validateForm(supplierId, e.target.value, items)) }}
                onBlur={() => handleBlur('warehouseId')}
                error={touched.warehouseId ? errors.warehouseId : undefined} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Items *</h4>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
              </div>
              {touched.items && errors.items && <p className="text-xs text-danger">{errors.items}</p>}
              {items.map((item, index) => (
                <div key={index} className="flex items-end gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <Select label="Product" placeholder="Select product" options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                      value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} />
                  </div>
                  <div className="w-24"><Input label="Qty" type="number" min="1" placeholder="0" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} /></div>
                  <div className="w-32"><Input label="Cost Price" type="number" min="0" placeholder="0" value={item.costPrice} onChange={(e) => updateItem(index, 'costPrice', e.target.value)} /></div>
                  {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-danger" /></Button>}
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Notes (optional)</label>
              <textarea className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href={`/app/purchases/${id}`}><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
