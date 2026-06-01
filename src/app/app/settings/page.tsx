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
    </div>
  )
}
