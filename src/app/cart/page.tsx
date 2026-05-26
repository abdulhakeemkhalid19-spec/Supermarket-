'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(saved)
    setCartCount(saved.reduce((sum: number, item: any) => sum + item.quantity, 0))
  }

  const updateQuantity = (id: string, quantity: number) => {
    const updated = cart
      .map((item) => item.id === id ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0)
    localStorage.setItem('cart', JSON.stringify(updated))
    setCart(updated)
    setCartCount(updated.reduce((sum, item) => sum + item.quantity, 0))
  }

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id)
    localStorage.setItem('cart', JSON.stringify(updated))
    setCart(updated)
    setCartCount(updated.reduce((sum, item) => sum + item.quantity, 0))
  }

  const clearCart = () => {
    localStorage.setItem('cart', '[]')
    setCart([])
    setCartCount(0)
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen" style={{background: '#0a0a0a'}}>

      {/* Navbar */}
      <nav style={{background: 'linear-gradient(180deg, #0d0d1a 0%, rgba(13,13,26,0.95) 100%)', borderBottom: '1px solid rgba(124,58,237,0.3)'}} className="sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <h1 className="text-2xl font-black tracking-wider" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              ✦ FRESHMART
            </h1>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/products" className="text-sm text-purple-300 hover:text-white transition font-medium">
              Shop
            </Link>
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)'}}>
                <span className="text-lg">🛒</span>
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f6d365, #fda085)', color: '#1a1a2e'}}>
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-8">
          Your Cart
          <span className="text-lg font-normal text-gray-500 ml-3">({cartCount} items)</span>
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-7xl mb-6">🛒</p>
            <p className="text-2xl font-black text-white mb-2">Your cart is empty</p>
            <p className="text-gray-500 mb-8">Add some premium products to get started!</p>
            <Link
              href="/products"
              className="px-10 py-4 rounded-full font-bold text-white transition-all hover:scale-105 inline-block"
              style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
            >
              Shop Now →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{background: 'rgba(124,58,237,0.15)'}}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-200 text-sm line-clamp-2">{item.name}</h3>
                    <p className="price-tag font-black text-base mt-1">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full font-bold text-white flex items-center justify-center transition hover:scale-110"
                      style={{background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)'}}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full font-bold text-white flex items-center justify-center transition hover:scale-110"
                      style={{background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)'}}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-white">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-xs hover:text-red-400 mt-1 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="card p-6">
              <h2 className="text-lg font-black text-white mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery Fee</span>
                  <span className="text-green-400 font-semibold">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-black text-xl" style={{borderColor: 'rgba(124,58,237,0.2)'}}>
                  <span className="text-white">Total</span>
                  <span className="price-tag">₦{total.toLocaleString()}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full text-center py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-105"
                style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
              >
                Proceed to Checkout →
              </Link>
              <button
                onClick={clearCart}
                className="w-full mt-3 text-gray-600 text-sm hover:text-red-400 transition"
              >
                Clear Cart
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{background: '#0d0d1a', borderTop: '1px solid rgba(124,58,237,0.2)'}} className="py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-black mb-2" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            ✦ FRESHMART
          </h2>
          <p className="text-gray-700 text-xs">© 2024 FreshMart. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
