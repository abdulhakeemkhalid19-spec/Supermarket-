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
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-purple-700 text-xl">⏳ Loading your order...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-50">

      {/* Navbar */}
      <nav className="bg-purple-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">🛒 FreshMart</Link>
          <Link href="/products" className="text-sm hover:underline">
            Continue Shopping
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Success Message */}
        <div className="card p-8 text-center mb-6">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-purple-800 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 mb-4">
            Thank you for shopping with FreshMart. Your order has been received!
          </p>
          <div className="bg-purple-50 rounded-lg px-6 py-3 inline-block">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono font-bold text-purple-800 text-sm">
              #{orderId?.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Order Details */}
        {order && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-purple-800 mb-4">
              📦 Order Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold">{order.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-semibold">{order.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address</span>
                <span className="font-semibold text-right max-w-xs">
                  {order.delivery_address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-semibold">Cash on Delivery</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-purple-800 mb-4">
            🛍️ Items Ordered
          </h2>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.product_name} x{item.quantity}
                </span>
                <span className="font-bold text-purple-700">
                  ₦{(item.unit_price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold text-purple-800">
              <span>Total</span>
              <span>₦{order?.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="card p-6 mb-6 bg-purple-50 border border-purple-200">
          <h2 className="text-lg font-bold text-purple-800 mb-3">
            📋 What happens next?
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <p className="text-sm text-gray-600">
                We have received your order and will process it shortly.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <p className="text-sm text-gray-600">
                Your items will be sourced and packaged carefully.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <p className="text-sm text-gray-600">
                Your order will be delivered to your address. Pay cash on delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 bg-purple-700 text-white text-center py-3 rounded-lg font-bold hover:bg-purple-800 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex-1 border-2 border-purple-700 text-purple-700 text-center py-3 rounded-lg font-bold hover:bg-purple-50 transition"
          >
            Back to Home
          </Link>
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

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-purple-700 text-xl">⏳ Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
                }
