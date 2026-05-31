'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    brandId: '',
    unitId: '',
    costPrice: '',
    sellingPrice: '',
    description: '',
    image: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const body = {
        name: form.name,
        sku: form.sku,
        barcode: form.barcode || undefined,
        categoryId: form.categoryId || undefined,
        brandId: form.brandId || undefined,
        unitId: form.unitId || undefined,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        description: form.description || undefined,
        image: form.image || undefined,
      }

      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        const errMsg = json.errors
          ? Object.values(json.errors).join(', ')
          : json.message || 'Failed to create product'
        throw new Error(errMsg)
      }
      router.push('/app/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Add Product">
        <Link href="/app/products">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Fill in the product details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-sm text-danger">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                placeholder="Enter product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="SKU"
                placeholder="Auto-generated or manual"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
              <Input
                label="Barcode"
                placeholder="Optional barcode"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              />
              <Select
                label="Category"
                placeholder="Select category"
                options={[
                  { value: '1', label: 'Makanan' },
                  { value: '2', label: 'Minuman' },
                  { value: '3', label: 'Elektronik' },
                ]}
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              />
              <Select
                label="Brand"
                placeholder="Select brand"
                options={[
                  { value: '1', label: 'Indomie' },
                  { value: '2', label: 'Aqua' },
                  { value: '3', label: 'Kopiko' },
                ]}
                value={form.brandId}
                onChange={(e) => setForm({ ...form, brandId: e.target.value })}
              />
              <Select
                label="Unit"
                placeholder="Select unit"
                options={[
                  { value: '1', label: 'Pcs' },
                  { value: '2', label: 'Botol' },
                  { value: '3', label: 'Kg' },
                ]}
                value={form.unitId}
                onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              />
              <Input
                label="Cost Price"
                type="number"
                placeholder="0"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                required
              />
              <Input
                label="Selling Price"
                type="number"
                placeholder="0"
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Image URL"
                  placeholder="https://example.com/product-image.jpg"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                {form.image && (
                  <div className="mt-2 relative h-32 w-32 rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL for the product image. Supported: JPG, PNG, WebP
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Description
              </label>
              <textarea
                className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
