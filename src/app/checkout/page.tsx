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
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.delivery_address) {
      alert('Please fill in all required fields!')
      return
    }
    setLoading(true)
    try {
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

      for (const item of cart) {
        try {
          await supabase.rpc('decrement_stock', {
            product_id: item.id,
            quantity: item.quantity,
          })
        } catch {
          // Stock update optional
        }
      }

      localStorage.setItem('cart', '[]')
      router.push(`/orders/success?id=${order.id}`)
    } catch (error) {
      alert('Something went wrong. Please try again!')
      console.error(error)
    }
    setLoading(false)
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(124,58,237,0.3)',
    color: 'white',
    borderRadius: '12px',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
  }

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
          <Link href="/cart" className="text-sm text-purple-300 hover:text-white transition">
            ← Back to Cart
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-8">Checkout</h1>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Form */}
          <div className="flex-1 card p-6">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
              📦 Delivery Information
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={form.customer_email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={form.customer_phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Delivery Address *
                </label>
                <textarea
                  name="delivery_address"
                  value={form.delivery_address}
                  onChange={handleChange}
                  placeholder="Enter your full delivery address"
                  rows={3}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Order Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions?"
                  rows={2}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="md:w-80 space-y-4">
            <div className="card p-6">
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
                🧾 Order Summary
              </p>
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400 line-clamp-1 flex-1 mr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-bold text-white shrink-0">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{borderTop: '1px solid rgba(124,58,237,0.2)'}} className="pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Delivery</span>
                  <span className="text-green-400 font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-black text-xl mt-2">
                  <span className="text-white">Total</span>
                  <span className="price-tag">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment notice */}
            <div className="card p-4" style={{background: 'linear-gradient(135deg, rgba(246,211,101,0.1), rgba(253,160,133,0.1))', border: '1px solid rgba(246,211,101,0.2)'}}>
              <p className="text-sm font-bold mb-1" style={{color: '#f6d365'}}>
                💰 Cash on Delivery
              </p>
              <p className="text-xs text-gray-400">
                Pay when your order arrives at your doorstep. No upfront payment needed.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
            >
              {loading ? '⏳ Placing Order...' : '✅ Place Order'}
            </button>
          </div>

        </div>
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
