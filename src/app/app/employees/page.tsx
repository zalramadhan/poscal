'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

interface EmployeeItem {
  id: string
  name: string
  email: string
  role: { id: string; name: string }
  branch: { id: string; name: string } | null
  status: string
  createdAt: string
}

interface Role {
  id: string
  name: string
}

interface Branch {
  id: string
  name: string
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
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(employee)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(employee.id, employee.name)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
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

function handleEdit(employee: EmployeeItem) {
  window.dispatchEvent(new CustomEvent('editEmployee', { detail: employee }))
}

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<EmployeeItem[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeItem | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    branchId: '',
  })

  React.useEffect(() => {
    fetchEmployees()
    fetchRoles()
    fetchBranches()

    function onEditEmployee(e: CustomEvent<EmployeeItem>) {
      setSelectedEmployee(e.detail)
      setFormData({
        name: e.detail.name,
        email: e.detail.email,
        password: '',
        roleId: e.detail.role?.id || '',
        branchId: e.detail.branch?.id || '',
      })
      setShowEditDialog(true)
    }

    window.addEventListener('editEmployee', onEditEmployee as EventListener)
    return () => window.removeEventListener('editEmployee', onEditEmployee as EventListener)
  }, [])

  async function fetchEmployees() {
    try {
      const res = await fetch('/api/v1/settings?section=users')
      const data = await res.json()
      setEmployees(data.data || [])
    } catch {
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchRoles() {
    try {
      const res = await fetch('/api/v1/settings?section=roles')
      const data = await res.json()
      setRoles(data.data || [])
    } catch {
      setRoles([])
    }
  }

  async function fetchBranches() {
    try {
      const res = await fetch('/api/v1/settings?section=branches')
      const data = await res.json()
      setBranches(data.data || [])
    } catch {
      setBranches([])
    }
  }

  async function handleAddEmployee() {
    if (!formData.name || !formData.email || !formData.password || !formData.roleId) return
    setSaving(true)
    try {
      const res = await fetch('/api/v1/settings?section=users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowAddDialog(false)
        setFormData({ name: '', email: '', password: '', roleId: '', branchId: '' })
        fetchEmployees()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateEmployee() {
    if (!selectedEmployee || !formData.name || !formData.roleId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/users?id=${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          roleId: formData.roleId,
          branchId: formData.branchId || null,
        }),
      })
      if (res.ok) {
        setShowEditDialog(false)
        setSelectedEmployee(null)
        setFormData({ name: '', email: '', password: '', roleId: '', branchId: '' })
        fetchEmployees()
      }
    } finally {
      setSaving(false)
    }
  }

  function openAddDialog() {
    setFormData({ name: '', email: '', password: '', roleId: '', branchId: '' })
    setShowAddDialog(true)
  }

  return (
    <div>
      <PageHeader title="Employees" description="Manage users and their roles">
        <Button onClick={openAddDialog}><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {!loading && (
            <DataTable columns={columns} data={employees} searchKey="name" searchPlaceholder="Search employees..." />
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter employee name"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password (min 6 characters)"
            />
            <Select
              label="Role"
              options={roles.map(r => ({ value: r.id, label: r.name }))}
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              placeholder="Select role"
            />
            <Select
              label="Branch"
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              placeholder="Select branch (optional)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee} disabled={saving || !formData.name || !formData.email || !formData.password || !formData.roleId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter employee name"
            />
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Email</p>
              <p className="text-sm text-muted-foreground">{selectedEmployee?.email}</p>
            </div>
            <Select
              label="Role"
              options={roles.map(r => ({ value: r.id, label: r.name }))}
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              placeholder="Select role"
            />
            <Select
              label="Branch"
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              placeholder="Select branch (optional)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateEmployee} disabled={saving || !formData.name || !formData.roleId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}