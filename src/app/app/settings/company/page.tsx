'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TenantData {
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

export default function CompanySettingsPage() {
  const [formData, setFormData] = React.useState<TenantData>({ name: '', email: '', phone: '', address: '' })
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/v1/settings?section=tenant')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setFormData({
            name: data.data.name || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
            address: data.data.address || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  function handleSave() {
    setSaving(true)
    fetch('/api/v1/settings?section=tenant', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.ok) alert('Company info saved!')
      })
      .catch(() => alert('Failed to save'))
      .finally(() => setSaving(false))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Company Profile" description="Manage your business information" />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Update your business details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Business Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="Phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <Input label="Plan" value="Starter" disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Address</label>
            <textarea
              className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm min-h-[80px]"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Badge variant="success">Active Subscription</Badge>
            <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
