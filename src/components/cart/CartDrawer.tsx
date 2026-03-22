'use client'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } = useCart()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-96 z-50 bg-primary border-l border-gold/20 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
          <span className="text-offwhite text-sm tracking-widest uppercase">
            Carrinho {totalItems > 0 && <span className="text-gold">({totalItems})</span>}
          </span>
          <button onClick={closeCart} className="text-offwhite/40 hover:text-gold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg className="w-10 h-10 text-gold/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              <p className="text-offwhite/40 text-sm">Seu carrinho está vazio</p>
              <Link href="/produtos" onClick={closeCart} className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors">
                Explorar produtos
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gold/10">
              {items.map((item) => (
                <li key={`${item.product.id}-${item.size}`} className="py-4 flex gap-4">
                  <div className="w-16 h-20 bg-offwhite/5 border border-gold/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-gold/20 text-[8px] uppercase">{item.product.brand}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-offwhite/40 text-[10px] tracking-widest uppercase">{item.product.brand}</p>
                    <p className="text-offwhite text-sm leading-snug mt-0.5 truncate">{item.product.name}</p>
                    <p className="text-offwhite/40 text-xs mt-1">Tamanho: {item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gold/20">
                        <button onClick={() => updateQty(item.product.id, item.size, item.quantity - 1)} className="w-7 h-7 text-offwhite/50 hover:text-gold flex items-center justify-center text-sm">−</button>
                        <span className="w-7 text-center text-offwhite text-xs">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.size, item.quantity + 1)} className="w-7 h-7 text-offwhite/50 hover:text-gold flex items-center justify-center text-sm">+</button>
                      </div>
                      <p className="text-gold text-sm font-medium">
                        R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.product.id, item.size)} className="text-offwhite/20 hover:text-gold transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gold/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-offwhite/50 text-sm">Total</span>
              <span className="text-offwhite text-lg font-medium">
                R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-offwhite/30 text-xs text-center">Frete calculado no checkout</p>
            <button className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors">
              Finalizar compra
            </button>
          </div>
        )}
      </div>
    </>
  )
}
