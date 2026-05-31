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
  const [form, setForm] = React.useState({
    warehouseId: '',
    productId: '',
    newQuantity: '',
    reason: '',
  })

  return (
    <div>
      <PageHeader title="Stock Adjustment" description="Adjust stock quantity">
        <Link href="/app/inventory"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
      </PageHeader>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Adjust Stock</CardTitle>
          <CardDescription>Set the correct quantity for a product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select label="Warehouse" placeholder="Select warehouse" options={[
            { value: '1', label: 'Gudang Utama' },
            { value: '2', label: 'Gudang Surabaya' },
          ]} value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} />
          <Select label="Product" placeholder="Select product" options={[
            { value: '1', label: 'Indomie Goreng (500)' },
            { value: '2', label: 'Aqua 600ml (1000)' },
          ]} value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} />
          <Input label="New Quantity" type="number" placeholder="0" value={form.newQuantity} onChange={(e) => setForm({ ...form, newQuantity: e.target.value })} />
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Reason</label>
            <textarea className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm min-h-[80px]" placeholder="Reason for adjustment" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link href="/app/inventory"><Button variant="outline">Cancel</Button></Link>
            <Button><Save className="h-4 w-4 mr-2" />Save Adjustment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
