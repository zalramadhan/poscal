'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import { useFetch } from '@/hooks'
import type { Supplier } from '@/types'

interface FormErrors {
  name?: string
  email?: string
  phone?: string
}

function validate(form: { name: string; phone: string; email: string; address: string; notes: string }): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) errors.name = 'Supplier name is required'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email address'
  if (form.phone && !/^[0-9+\-\s()]+$/.test(form.phone)) errors.phone = 'Please enter a valid phone number'
  return errors
}

export default function EditSupplierPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: supplier, loading, error, refetch } = useFetch<Supplier>(`/api/v1/suppliers/${id}`)
  const [saving, setSaving] = React.useState(false)
  const [fetchError, setFetchError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ name: '', phone: '', email: '', address: '', notes: '' })
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (!supplier) return
    setForm({
      name: supplier.name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
    })
  }, [supplier])

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors(validate(form))
  }

  function handleChange(field: keyof typeof form, value: string) {
    const updated = { ...form, [field]: value }
    setForm(updated)
    if (touched[field]) setErrors(validate(updated))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = validate(form)
    setErrors(validation)
    setTouched({ name: true, email: true, phone: true })
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    setFetchError(null)

    try {
      const body = {
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        notes: form.notes || undefined,
      }

      const res = await fetch(`/api/v1/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        const errMsg = json.errors
          ? Object.values(json.errors).join(', ')
          : json.message || 'Failed to update supplier'
        throw new Error(errMsg)
      }
      router.push(`/app/suppliers/${id}`)
      router.refresh()
    } catch (err: any) {
      setFetchError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Loading supplier..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />
  if (!supplier) return <ErrorState title="Not Found" message="Supplier not found" onRetry={() => router.refresh()} />

  return (
    <div>
      <PageHeader title={`Edit: ${supplier.name}`}>
        <Link href={`/app/suppliers/${id}`}>
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
          <CardDescription>Edit supplier details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {fetchError && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-sm text-danger">{fetchError}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Supplier Name *"
                placeholder="Enter supplier name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                error={touched.name ? errors.name : undefined}
                required
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="08xx-xxxx-xxxx"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? errors.phone : undefined}
              />
              <Input
                label="Email"
                type="email"
                placeholder="supplier@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : undefined}
              />
              <Input
                label="Address"
                placeholder="Supplier address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Notes</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                placeholder="Optional notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
