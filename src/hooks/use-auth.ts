// ──────────────────────────────────────────────────────
// POS AI - Auth Hook
// ──────────────────────────────────────────────────────

'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { user, isAuthenticated, isLoading, login: storeLogin, logout: storeLogout, setLoading } = useAuthStore()
  const router = useRouter()

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Login failed')
      storeLogin(json.data.user, json.data.token)
      router.push('/app/dashboard')
      return { success: true }
    } catch (err: any) {
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [storeLogin, router, setLoading])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' })
    } catch { /* ignore */ }
    storeLogout()
    router.push('/auth/login')
  }, [storeLogout, router])

  return { user, isAuthenticated, isLoading, login, logout }
}
