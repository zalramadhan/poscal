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
  addItem: (item: Omit<CartItem, 'subtotal'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateDiscount: (productId: string, discount: number) => void
  setCustomer: (customerId: string | null) => void
  setGlobalDiscount: (discount: number) => void
  setNotes: (notes: string) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  discount: 0,
  notes: '',

  addItem: (item) => {
    const existing = get().items.find((i) => i.productId === item.productId)
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.price - i.discount }
            : i
        ),
      }))
    } else {
      set((state) => ({
        items: [...state.items, { ...item, subtotal: item.quantity * item.price - item.discount }],
      }))
    }
  },

  removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity, subtotal: quantity * i.price - i.discount } : i
      ),
    })),

  updateDiscount: (productId, discount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, discount, subtotal: i.quantity * i.price - discount } : i
      ),
    })),

  setCustomer: (customerId) => set({ customerId }),
  setGlobalDiscount: (discount) => set({ discount }),
  setNotes: (notes) => set({ notes }),
  clearCart: () => set({ items: [], customerId: null, discount: 0, notes: '' }),

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
  getTotal: () => {
    const subtotal = get().items.reduce((sum, i) => sum + i.subtotal, 0)
    return subtotal - get().discount
  },
}))
