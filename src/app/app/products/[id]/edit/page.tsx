'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, ErrorState, LoadingState } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Trash2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useFetch } from '@/hooks'
import type { Product } from '@/types'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: product, loading, error, refetch } = useFetch<Product>(`/api/v1/products/${id}`)
  const [saving, setSaving] = React.useState(false)
  const [fetchError, setFetchError] = React.useState<string | null>(null)
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
    isActive: true,
    minStock: '',
    maxStock: '',
  })

  // Populate form when product data loads
  React.useEffect(() => {
    if (!product) return
    // The API returns product with nested relations, populate form
    const p = product as any
    setForm({
      name: p.name || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      categoryId: p.category?.id || p.categoryId || '',
      brandId: p.brand?.id || p.brandId || '',
      unitId: p.unit?.id || p.unitId || '',
      costPrice: String(p.costPrice ?? ''),
      sellingPrice: String(p.sellingPrice ?? ''),
      description: p.description || '',
      image: p.image || '',
      isActive: p.isActive !== undefined ? p.isActive : true,
      minStock: p.minStock !== null && p.minStock !== undefined ? String(p.minStock) : '',
      maxStock: p.maxStock !== null && p.maxStock !== undefined ? String(p.maxStock) : '',
    })
  }, [product])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFetchError(null)

    try {
      const body: Record<string, unknown> = {
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
        isActive: form.isActive,
        minStock: form.minStock ? Number(form.minStock) : undefined,
        maxStock: form.maxStock ? Number(form.maxStock) : undefined,
      }

      const res = await fetch(`/api/v1/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        const errMsg = json.errors
          ? Object.values(json.errors).join(', ')
          : json.message || 'Failed to update product'
        throw new Error(errMsg)
      }
      router.push('/app/products')
      router.refresh()
    } catch (err: any) {
      setFetchError(err.message)
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Failed to delete product')
      router.push('/app/products')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Loading product..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />
  if (!product) return <ErrorState title="Not Found" message="Product not found" onRetry={() => router.refresh()} />

  return (
    <div>
      <PageHeader title="Edit Product">
        <div className="flex items-center gap-2">
          <Link href="/app/products">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </PageHeader>

      {fetchError && (
        <div className="mb-4 p-3 rounded-md bg-danger/10 border border-danger/20 text-sm text-danger">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Edit the product details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Update Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant={form.isActive ? 'success' : 'outline'}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image}
                    alt={form.name}
                    className="h-24 w-24 rounded-lg object-cover mb-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center mb-3">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <p className="text-sm font-medium">{form.name || 'Product Name'}</p>
                {form.sku && (
                  <p className="text-xs text-muted-foreground mt-0.5">SKU: {form.sku}</p>
                )}
                {form.sellingPrice && (
                  <p className="text-sm font-semibold text-primary mt-2">
                    {formatCurrency(Number(form.sellingPrice))}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stock Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Min Stock Level"
                type="number"
                placeholder="0"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              />
              <Input
                label="Max Stock Level"
                type="number"
                placeholder="0"
                value={form.maxStock}
                onChange={(e) => setForm({ ...form, maxStock: e.target.value })}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
