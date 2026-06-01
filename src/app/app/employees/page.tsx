'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

interface EmployeeItem {
  id: string
  name: string
  email: string
  role: { name: string }
  branch: { name: string } | null
  status: string
  createdAt: string
}

const columns: ColumnDef<EmployeeItem>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <Badge variant="default">{row.original.role?.name || '-'}</Badge>,
  },
  {
    accessorKey: 'branch',
    header: 'Branch',
    cell: ({ row }) => row.original.branch?.name || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'ACTIVE' ? 'success' : 'outline'}>
        {row.getValue('status')}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const employee = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(employee.id, employee.name)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )
    },
  },
]

function handleDelete(id: string, name: string) {
  if (!confirm(`Delete employee "${name}"?`)) return

  fetch(`/api/v1/users?id=${id}`, { method: 'DELETE' })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to delete')
      window.location.reload()
    })
    .catch(() => alert('Failed to delete employee'))
}

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<EmployeeItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/v1/settings?section=users')
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.data || [])
        setLoading(false)
      })
      .catch(() => {
        alert('Failed to load employees')
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <PageHeader title="Employees" description="Manage users and their roles">
        <Button><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {!loading && (
            <DataTable columns={columns} data={employees} searchKey="name" searchPlaceholder="Search employees..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
