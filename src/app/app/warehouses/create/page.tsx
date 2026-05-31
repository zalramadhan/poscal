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
import { useFetch } from '@/hooks'
import type { Branch } from '@/types'

export default function CreateWarehousePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    branchId: '',
    name: '',
    code: '',
    address: '',
  })

  const { data: branchesData } = useFetch<Branch[]>('/api/v1/settings?section=branches')
  const branches = Array.isArray(branchesData) ? branchesData : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const body = {
        branchId: form.branchId,
        name: form.name,
        code: form.code,
        address: form.address || undefined,
        isActive: true,
      }

      const res = await fetch('/api/v1/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        const errMsg = json.errors
          ? Object.values(json.errors).join(', ')
          : json.message || 'Failed to create warehouse'
        throw new Error(errMsg)
      }
      router.push('/app/warehouses')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Add Warehouse">
        <Link href="/app/warehouses">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Warehouse Information</CardTitle>
          <CardDescription>Add a new warehouse location</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Branch"
                placeholder="Select branch"
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              />
              <Input
                label="Warehouse Name"
                placeholder="e.g. Gudang Utama"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Code"
                placeholder="e.g. WH-001"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
              <Input
                label="Address"
                placeholder="Warehouse address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Warehouse'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
