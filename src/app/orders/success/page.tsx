'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  useEffect(() => {
    if (orderId) fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    if (orderData) setOrder(orderData)

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
    if (itemsData) setOrderItems(itemsData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0a0a0a'}}>
        <p className="text-purple-400 text-xl">⏳ Loading your order...</p>
      </div>
    )
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
          <Link href="/products" className="text-sm text-purple-300 hover:text-white transition">
            Continue Shopping
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Success Banner */}
        <div className="card p-10 text-center mb-6" style={{background: 'linear-gradient(135deg, #1a0533, #0d0d1a)', border: '1px solid rgba(124,58,237,0.4)'}}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 0 60px rgba(124,58,237,0.5)'}}>
            <span className="text-5xl">✓</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">
            Order Confirmed!
          </h1>
          <p className="text-gray-400 mb-6">
            Thank you for shopping with FreshMart. Your order has been received and is being processed.
          </p>
          <div className="inline-block px-6 py-3 rounded-xl" style={{background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)'}}>
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Order ID</p>
            <p className="font-mono font-black text-purple-300">
              #{orderId?.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Order Details */}
        {order && (
          <div className="card p-6 mb-4">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
              📦 Delivery Details
            </p>
            <div className="space-y-3">
              {[
                {label: 'Name', value: order.customer_name},
                {label: 'Email', value: order.customer_email},
                {label: 'Phone', value: order.customer_phone},
                {label: 'Address', value: order.delivery_address},
                {label: 'Payment', value: 'Cash on Delivery'},
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm" style={{borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px'}}>
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-200 text-right max-w-xs">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase" style={{background: 'rgba(246,211,101,0.15)', color: '#f6d365'}}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card p-6 mb-4">
          <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
            🛍️ Items Ordered
          </p>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm" style={{borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px'}}>
                <span className="text-gray-400">
                  {item.product_name} x{item.quantity}
                </span>
                <span className="font-black price-tag">
                  ₦{(item.unit_price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-black text-lg pt-2">
              <span className="text-white">Total</span>
              <span className="price-tag">₦{order?.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="card p-6 mb-8" style={{background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(76,29,149,0.1))', border: '1px solid rgba(124,58,237,0.2)'}}>
          <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
            📋 What Happens Next
          </p>
          <div className="space-y-4">
            {[
              {icon: '1️⃣', text: 'We have received your order and will process it shortly.'},
              {icon: '2️⃣', text: 'Your items will be sourced and packaged carefully.'},
              {icon: '3️⃣', text: 'Your order will be delivered to your address. Pay cash on delivery.'},
            ].map((step) => (
              <div key={step.icon} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{step.icon}</span>
                <p className="text-sm text-gray-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 text-center py-4 rounded-xl font-black text-white transition-all hover:scale-105"
            style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex-1 text-center py-4 rounded-xl font-black text-white transition-all hover:scale-105"
            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}
          >
            Back to Home
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer style={{background: '#0d0d1a', borderTop: '1px solid rgba(124,58,237,0.2)'}} className="py-12 px-4 mt-8">
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

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0a0a0a'}}>
        <p className="text-purple-400 text-xl">⏳ Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
