'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Building2, MapPin, Phone, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface BranchItem {
  id: string
  name: string
  code: string
  address: string
  phone: string
  status: string
}

export default function BranchesSettingsPage() {
  const [branches, setBranches] = React.useState<BranchItem[]>([])

  React.useEffect(() => {
    fetch('/api/v1/settings?section=branches')
      .then((res) => res.json())
      .then((data) => setBranches(data.data || []))
  }, [])

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete branch "${name}"?`)) return
    fetch(`/api/v1/branches?id=${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete')
        window.location.reload()
      })
      .catch(() => alert('Failed to delete branch'))
  }

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
          <Card key={branch.id} className="hover:shadow-md transition-all">
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
                <div className="flex items-center gap-2">
                  <Badge variant="success">{branch.status || 'Active'}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(branch.id, branch.name)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
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
