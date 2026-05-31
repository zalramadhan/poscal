'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorState } from '@/components/shared/page-states'
import { formatCurrency } from '@/lib/utils'
import { useFetch } from '@/hooks'
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Check,
  X,
  DollarSign,
  CreditCard,
  Smartphone,
  Package,
} from 'lucide-react'
import type { Product } from '@/types'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: DollarSign },
  { id: 'debit', name: 'Debit Card', icon: CreditCard },
  { id: 'qris', name: 'QRIS', icon: Smartphone },
]

export default function POSPage() {
  const router = useRouter()
  const { data: products, loading, error, refetch } = useFetch<Product[]>('/api/v1/products')
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [search, setSearch] = React.useState('')
  const [selectedPayment, setSelectedPayment] = React.useState('1')
  const [checkoutLoading, setCheckoutLoading] = React.useState(false)
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null)

  const productList = Array.isArray(products) ? products : []
  const filteredProducts = productList.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || '').toLowerCase().includes(search.toLowerCase()),
  )

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { id: product.id, name: product.name, price: product.sellingPrice, quantity: 1 }]
    })
  }

  function updateQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  async function handleCheckout() {
    if (cart.length === 0) return
    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const body = {
        branchId: 'default-branch', // Default branch — in production would come from user session
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        payments: [
          {
            paymentMethodId: selectedPayment,
            amount: subtotal,
          },
        ],
        discount: 0,
        notes: undefined,
      }

      const res = await fetch('/api/v1/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Checkout failed')

      // Clear cart and navigate to sales history
      setCart([])
      router.push('/app/pos/history')
      router.refresh()
    } catch (err: any) {
      setCheckoutError(err.message)
      setCheckoutLoading(false)
    }
  }

  if (loading) return <LoadingState message="Loading products..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Left - Product Grid */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <Input
            placeholder="Search products by name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {search ? 'No products match your search' : 'No products available'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-3 rounded-lg border border-border bg-surface hover:border-primary hover:shadow-sm transition-all text-left flex flex-col"
                >
                  <div className="flex items-start gap-3">
                    {/* Product image or placeholder */}
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-primary/5 shrink-0 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary/60" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight line-clamp-2 break-words">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {formatCurrency(product.sellingPrice)}
                      </p>
                    </div>
                  </div>
                  {product.category && (
                    <Badge variant="outline" className="mt-2 self-start text-[10px]">
                      {product.category.name}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right - Cart */}
      <div className="w-full lg:w-96 flex flex-col bg-surface rounded-lg border border-border">
        {/* Cart Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Cart</h2>
            <Badge variant="default" className="ml-auto">
              {cart.length} items
            </Badge>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Cart is empty</p>
              <p className="text-xs text-muted-foreground">Click products to add them</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 rounded hover:bg-muted"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 rounded hover:bg-muted"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm font-medium w-20 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Payment Methods */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setSelectedPayment(pm.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                  selectedPayment === pm.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <pm.icon className="h-4 w-4" />
                {pm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {checkoutError && (
          <div className="px-4 py-2 text-xs text-danger bg-danger/5 border-t border-border">
            {checkoutError}
          </div>
        )}

        {/* Cart Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={cart.length === 0 || checkoutLoading}
              onClick={() => setCart([])}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              size="lg"
              className="flex-1"
              disabled={cart.length === 0 || checkoutLoading}
              onClick={handleCheckout}
            >
              {checkoutLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
