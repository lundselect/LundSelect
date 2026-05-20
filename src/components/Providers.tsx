'use client'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { ToastProvider } from '@/contexts/ToastContext'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            {children}
            <CartDrawer />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
