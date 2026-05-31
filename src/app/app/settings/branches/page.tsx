'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Building2, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

const branches = [
  { name: 'Cabang Pusat', code: 'PST', address: 'Jl. Merdeka No. 123', phone: '021-12345678', status: 'Active' },
  { name: 'Cabang Surabaya', code: 'SBY', address: 'Jl. Panglima Sudirman No. 45', phone: '031-87654321', status: 'Active' },
  { name: 'Cabang Jakarta', code: 'JKT', address: 'Jl. Thamrin No. 67', phone: '021-55551234', status: 'Active' },
]

export default function BranchesSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <PageHeader title="Branches" description="Manage your business branches" />
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Branch</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card key={branch.code} className="hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                    <CardDescription>Code: {branch.code}</CardDescription>
                  </div>
                </div>
                <Badge variant="success">{branch.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {branch.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {branch.phone}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
