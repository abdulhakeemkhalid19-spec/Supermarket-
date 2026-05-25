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
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    ).filter((item) => item.quantity > 0)
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
    <div className="min-h-screen bg-purple-50">

      {/* Navbar */}
      <nav className="bg-purple-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">🛒 FreshMart</Link>
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-sm hover:underline">Products</Link>
            <div className="relative">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-purple-800 mb-6">
          🛒 Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-xl font-semibold mb-2">Your cart is empty</p>
            <p className="mb-6">Add some products to get started!</p>
            <Link
              href="/products"
              className="bg-purple-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-800 transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  <div className="bg-purple-100 rounded-lg w-20 h-20 flex items-center justify-center shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-purple-700 font-bold">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full font-bold hover:bg-purple-200 transition"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full font-bold hover:bg-purple-200 transition"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-800">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 text-sm hover:text-red-600 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg text-purple-800">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-purple-700 text-white text-center py-3 rounded-lg font-bold text-lg hover:bg-purple-800 transition"
              >
                Proceed to Checkout →
              </Link>
              <button
                onClick={clearCart}
                className="w-full mt-3 text-red-400 text-sm hover:text-red-600"
              >
                Clear Cart
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-purple-900 text-purple-200 mt-16 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-2xl font-bold text-white mb-2">🛒 FreshMart</p>
          <p className="text-sm">© 2024 FreshMart. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
