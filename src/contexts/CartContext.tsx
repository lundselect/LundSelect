'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { products as allProducts } from '@/lib/data'

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product, size: string) => void
  removeItem: (productId: string, size: string) => void
  updateQty: (productId: string, size: string, qty: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load cart when user changes — merges guest cart into Supabase on login
  useEffect(() => {
    if (user) {
      mergeAndLoad(user.id)
    } else {
      const stored = localStorage.getItem('lund_cart')
      setItems(stored ? JSON.parse(stored) : [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function mergeAndLoad(userId: string) {
    // Read guest cart before clearing it
    const guestItems: CartItem[] = (() => {
      try {
        const stored = localStorage.getItem('lund_cart')
        return stored ? JSON.parse(stored) : []
      } catch { return [] }
    })()

    // Load existing Supabase cart
    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)

    const supabaseItems: CartItem[] = (data || []).flatMap((row) => {
      const product = allProducts.find((p) => p.id === row.product_id)
      if (!product) return []
      return [{ product, size: row.size, quantity: row.quantity }]
    })

    // Merge: Supabase wins on conflicts, guest-only items are added
    const merged = [...supabaseItems]
    const upsertPayloads: { user_id: string; product_id: string; size: string; quantity: number }[] = []

    for (const guestItem of guestItems) {
      const exists = merged.find(
        (i) => i.product.id === guestItem.product.id && i.size === guestItem.size
      )
      if (!exists) {
        merged.push(guestItem)
        upsertPayloads.push({
          user_id: userId,
          product_id: guestItem.product.id,
          size: guestItem.size,
          quantity: guestItem.quantity,
        })
      }
    }

    if (upsertPayloads.length > 0) {
      await supabase.from('cart_items').upsert(upsertPayloads)
    }
    localStorage.removeItem('lund_cart')
    setItems(merged)
  }

  function saveLocal(next: CartItem[]) {
    localStorage.setItem('lund_cart', JSON.stringify(next))
  }

  const addItem = async (product: Product, size: string) => {
    let next: CartItem[]
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size)
      next = existing
        ? prev.map((i) =>
            i.product.id === product.id && i.size === size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...prev, { product, size, quantity: 1 }]
      return next
    })
    setIsOpen(true)

    if (user) {
      const existing = items.find((i) => i.product.id === product.id && i.size === size)
      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('size', size)
      } else {
        await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: product.id, size, quantity: 1 })
      }
    } else {
      setItems((curr) => { saveLocal(curr); return curr })
    }
  }

  const removeItem = async (productId: string, size: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => !(i.product.id === productId && i.size === size))
      if (!user) saveLocal(next)
      return next
    })
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size)
    }
  }

  const updateQty = async (productId: string, size: string, qty: number) => {
    if (qty < 1) { removeItem(productId, size); return }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
      )
      if (!user) saveLocal(next)
      return next
    })
    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity: qty })
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size)
    }
  }

  const clearCart = async () => {
    setItems([])
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    } else {
      localStorage.removeItem('lund_cart')
    }
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      addItem, removeItem, updateQty, clearCart, totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
