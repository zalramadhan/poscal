'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Save, Building2, Users, Shield, CreditCard, Store } from 'lucide-react'

const settingsSections = [
  { title: 'Company Profile', description: 'Manage your business information', icon: Store, href: '/app/settings/company' },
  { title: 'Branches', description: 'Manage business branches', icon: Building2, href: '/app/settings/branches' },
  { title: 'Users & Roles', description: 'Manage user permissions', icon: Shield, href: '/app/settings/roles' },
  { title: 'Subscription', description: 'Manage your plan and billing', icon: CreditCard, href: '/app/settings/subscription' },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your business settings" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Settings Card */}
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
            <Input label="Plan" defaultValue="Starter" disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Address</label>
            <textarea className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-sm min-h-[80px]" defaultValue="Jl. Merdeka No. 123, Jakarta Pusat" />
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
