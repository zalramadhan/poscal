// ──────────────────────────────────────────────────────
// POS AI - UI Store (Zustand)
// ──────────────────────────────────────────────────────

import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  currentBranchId: string | null
  toasts: { id: string; type: 'success' | 'error' | 'info'; message: string }[]
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCurrentBranch: (branchId: string | null) => void
  addToast: (type: 'success' | 'error' | 'info', message: string) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  currentBranchId: null,
  toasts: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentBranch: (branchId) => set({ currentBranchId: branchId }),
  addToast: (type, message) => {
    const id = Date.now().toString()
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
