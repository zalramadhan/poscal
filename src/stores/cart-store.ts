// ──────────────────────────────────────────────────────
// POS AI - Cart Store (Zustand)
// ──────────────────────────────────────────────────────

import { create } from 'zustand'

interface CartItem {
  productId: string
  name: string
  sku: string
  price: number
  quantity: number
  discount: number
  subtotal: number
}

interface CartState {
  items: CartItem[]
  customerId: string | null
  discount: number
  notes: string
  cartId: string
  warehouseId: string
  addItem: (item: Omit<CartItem, 'subtotal'>) => Promise<{ success: boolean; error?: string }>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean; error?: string }>
  updateDiscount: (productId: string, discount: number) => void
  setCustomer: (customerId: string | null) => void
  setGlobalDiscount: (discount: number) => void
  setNotes: (notes: string) => void
  clearCart: () => Promise<void>
  setWarehouse: (warehouseId: string) => void
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  discount: 0,
  notes: '',
  cartId: crypto.randomUUID(),
  warehouseId: '',

  setWarehouse: (warehouseId) => set({ warehouseId }),

  addItem: async (item) => {
    const state = get()
    const warehouseId = state.warehouseId
    if (!warehouseId) return { success: false, error: 'No warehouse selected' }

    const existing = state.items.find((i) => i.productId === item.productId)
    const newQuantity = existing ? existing.quantity + item.quantity : item.quantity

    try {
      const res = await fetch('/api/v1/inventory/reservation?action=reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId,
          cartId: state.cartId,
          items: [{ productId: item.productId, quantity: newQuantity }],
        }),
      })

      const data = await res.json()
      if (!res.ok) return { success: false, error: data.message || 'Reservation failed' }

      if (data.data?.errors?.length > 0) {
        return { success: false, error: `Only ${data.data.errors[0].available} available` }
      }

      if (existing) {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: newQuantity, subtotal: newQuantity * i.price - i.discount }
              : i
          ),
        }))
      } else {
        set((state) => ({
          items: [...state.items, { ...item, subtotal: item.quantity * item.price - item.discount }],
        }))
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  },

  removeItem: async (productId) => {
    const state = get()
    await fetch('/api/v1/inventory/reservation?action=release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId: state.cartId }),
    })
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }))
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(productId)
      return { success: true }
    }

    const state = get()
    try {
      const res = await fetch('/api/v1/inventory/reservation?action=reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: state.warehouseId,
          cartId: state.cartId,
          items: [{ productId, quantity }],
        }),
      })

      const data = await res.json()
      if (!res.ok || data.data?.errors?.length > 0) {
        const available = data.data?.errors?.[0]?.available ?? 0
        return { success: false, error: `Only ${available} available` }
      }

      set((state) => ({
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity, subtotal: quantity * i.price - i.discount } : i
        ),
      }))
      return { success: true }
    } catch {
      return { success: false, error: 'Network error' }
    }
  },

  updateDiscount: (productId, discount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, discount, subtotal: i.quantity * i.price - discount } : i
      ),
    })),

  setCustomer: (customerId) => set({ customerId }),
  setGlobalDiscount: (discount) => set({ discount }),
  setNotes: (notes) => set({ notes }),

  clearCart: async () => {
    const state = get()
    if (state.items.length > 0) {
      await fetch('/api/v1/inventory/reservation?action=release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: state.cartId }),
      })
    }
    set({ items: [], customerId: null, discount: 0, notes: '', cartId: crypto.randomUUID() })
  },

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
  getTotal: () => {
    const subtotal = get().items.reduce((sum, i) => sum + i.subtotal, 0)
    return subtotal - get().discount
  },
}))
