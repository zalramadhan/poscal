'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function AdjustmentPage() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [warehouses, setWarehouses] = React.useState<Array<{id: string, name: string}>>([])
  const [products, setProducts] = React.useState<Array<{id: string, name: string}>>([])
  const [form, setForm] = React.useState({
    warehouseId: '',
    productId: '',
    newQuantity: '',
    notes: '',
  })

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
          setForm(f => ({ ...f, warehouseId: whData.data[0].id }))
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

  async function handleSubmit() {
    if (!form.warehouseId || !form.productId || !form.newQuantity) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/inventory?action=adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: form.warehouseId,
          productId: form.productId,
          newQuantity: Number(form.newQuantity),
          notes: form.notes,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.message || 'Failed to save')
      }

      setForm({ ...form, productId: '', newQuantity: '', notes: '' })
      alert('Adjustment saved successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Stock Adjustment" description="Adjust stock quantity">
        <Link href="/app/inventory">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Adjust Stock</CardTitle>
          <CardDescription>Set the correct quantity for a product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <Select
            label="Warehouse"
            placeholder="Select warehouse"
            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
            value={form.warehouseId}
            onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
          />
          <Select
            label="Product"
            placeholder="Select product"
            options={products.map(p => ({ value: p.id, label: p.name }))}
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          />
          <Input
            label="New Quantity"
            type="number"
            placeholder="0"
            value={form.newQuantity}
            onChange={(e) => setForm({ ...form, newQuantity: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Reason</label>
            <textarea
              className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm min-h-[80px]"
              placeholder="Reason for adjustment"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/app/inventory">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Adjustment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}