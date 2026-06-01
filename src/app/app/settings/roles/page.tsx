'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Shield, UserCog, Users, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface RoleItem {
  id: string
  name: string
  permissions: { permission: { id: string; name: string } }[]
  _count: { users: number }
}

interface UserItem {
  id: string
  name: string
  email: string
  role: { name: string }
  status: string
}

export default function RolesSettingsPage() {
  const [roles, setRoles] = React.useState<RoleItem[]>([])
  const [users, setUsers] = React.useState<UserItem[]>([])

  React.useEffect(() => {
    fetch('/api/v1/settings?section=roles')
      .then((res) => res.json())
      .then((data) => setRoles(data.data || []))
    fetch('/api/v1/settings?section=users')
      .then((res) => res.json())
      .then((data) => setUsers(data.data || []))
  }, [])

  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({ name: '', email: '', password: '', roleId: '' })

  function handleDeleteRole(id: string, name: string) {
    if (!confirm(`Delete role "${name}"?`)) return
    fetch(`/api/v1/roles?id=${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete')
        window.location.reload()
      })
      .catch(() => alert('Failed to delete role'))
  }

  async function handleAddUser() {
    if (!formData.name || !formData.email || !formData.password || !formData.roleId) return
    setLoading(true)
    try {
      const res = await fetch('/api/v1/settings?section=users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowAddDialog(false)
        setFormData({ name: '', email: '', password: '', roleId: '' })
        const [rolesData, usersData] = await Promise.all([
          fetch('/api/v1/settings?section=roles').then(r => r.json()),
          fetch('/api/v1/settings?section=users').then(r => r.json()),
        ])
        setRoles(rolesData.data || [])
        setUsers(usersData.data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <PageHeader title="Users & Roles" description="Manage user permissions and roles" />
        </div>
        <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Roles</CardTitle>
          </div>
          <CardDescription>Define role-based access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-muted-foreground">{role._count?.users || 0} user(s)</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id, role.name)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <Badge variant="outline">{role.name}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle>Users</CardTitle>
          </div>
          <CardDescription>Manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{user.role?.name || '-'}</Badge>
                  <Badge variant="success">{user.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter name" />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email" />
            <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password" />
            <Select
              label="Role"
              options={roles.map(r => ({ value: r.id, label: r.name }))}
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              placeholder="Select role"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={loading}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
