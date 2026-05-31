'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CompanySettingsPage() {
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
            <Input label="Business Name" defaultValue="PT Maju Jaya" />
            <Input label="Email" type="email" defaultValue="info@majujaya.com" />
            <Input label="Phone" defaultValue="021-12345678" />
            <Input label="Tax ID" defaultValue="01.234.567.8-999.000" />
            <Input label="Website" defaultValue="https://majujaya.com" />
            <Input label="Plan" defaultValue="Growth" disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Address</label>
            <textarea
              className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm min-h-[80px]"
              defaultValue="Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta 10110"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Badge variant="success">Active Subscription</Badge>
            <Button><Save className="h-4 w-4 mr-2" />Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
