'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const mockOpnames = [
  { id: '1', warehouse: 'Gudang Utama', status: 'COMPLETED', items: 45, createdBy: 'Admin', createdAt: new Date().toISOString() },
  { id: '2', warehouse: 'Gudang Surabaya', status: 'DRAFT', items: 0, createdBy: 'Admin', createdAt: new Date().toISOString() },
]

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
  COMPLETED: 'success',
  APPROVED: 'info',
  DRAFT: 'default',
  REJECTED: 'warning',
}

export default function OpnamePage() {
  return (
    <div>
      <PageHeader title="Stock Opname" description="Physical stock counting">
        <Button><Plus className="h-4 w-4 mr-2" />New Opname</Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Opname History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Warehouse</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockOpnames.map((opname) => (
                  <tr key={opname.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{opname.warehouse}</td>
                    <td className="px-4 py-3 text-sm">{opname.items}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[opname.status] ?? 'default'}>{opname.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(opname.createdAt)}</td>
                    <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
