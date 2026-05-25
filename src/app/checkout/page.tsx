'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    notes: '',
  })

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]')
    if (saved.length === 0) router.push('/cart')
    setCart(saved)
  }, [])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (
      !form.customer_name ||
      !form.customer_email ||
      !form.customer_phone ||
      !form.delivery_address
    ) {
      alert('Please fill in all required fields!')
      return
    }

    setLoading(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          delivery_address: form.delivery_address,
          notes: form.notes,
          total_amount: total,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Update stock
      for (const item of cart) {
        await supabase.rpc('decrement_stock', {
          product_id: item.id,
          quantity: item.quantity,
        }).catch(() => {
          // Stock update is optional, won't block order
        })
      }

      // Clear cart
      localStorage.setItem('cart', '[]')

      // Redirect to success page
      router.push(`/orders/success?id=${order.id}`)

    } catch (error) {
      alert('Something went wrong. Please try again!')
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-purple-50">

      {/* Navbar */}
      <nav className="bg-purple-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">🛒 FreshMart</Link>
          <Link href="/cart" className="text-sm hover:underline">← Back to Cart</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-purple-800 mb-6">
          💳 Checkout
        </h1>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Delivery Form */}
          <div className="flex-1 card p-6">
            <h2 className="text-lg font-bold text-purple-800 mb-4">
              📦 Delivery Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={form.customer_email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={form.customer_phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">
                  Delivery Address *
                </label>
                <textarea
                  name="delivery_address"
                  value={form.delivery_address}
                  onChange={handleChange}
                  placeholder="Enter your full delivery address"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">
                  Order Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions?"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:w-80">
            <div className="card p-6 mb-4">
              <h2 className="text-lg font-bold text-purple-800 mb-4">
                🧾 Order Summary
              </h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-purple-800">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Notice */}
            <div className="card p-4 mb-4 bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800 font-semibold mb-1">
                💰 Payment on Delivery
              </p>
              <p className="text-xs text-yellow-700">
                Pay cash when your order arrives at your doorstep.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Placing Order...' : '✅ Place Order'}
            </button>
          </div>

        </div>
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
