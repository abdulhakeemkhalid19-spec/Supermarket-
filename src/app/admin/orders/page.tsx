'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoading(false)
  }

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
    if (data) setOrderItems(data)
  }

  const viewOrder = async (order: any) => {
    setSelectedOrder(order)
    await fetchOrderItems(order.id)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    fetchOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status })
    }
  }

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const filtered = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders

  return (
    <div className="min-h-screen bg-purple-50">

      {/* Navbar */}
      <nav className="bg-purple-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold">🛒 FreshMart</Link>
            <span className="bg-purple-600 text-xs px-2 py-1 rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="hover:underline">Dashboard</Link>
            <Link href="/admin/products" className="hover:underline">Products</Link>
            <Link href="/admin/stock" className="hover:underline">Stock</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-purple-800 mb-6">
          🚚 Manage Orders
        </h1>

        {/* Filter by Status */}
        <div className="card p-4 mb-6 flex gap-2 overflow-x-auto">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold capitalize transition ${
                filterStatus === status
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
              }`}
            >
              {status === '' ? 'All Orders' : status}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Orders List */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 text-purple-400">
                <p className="text-5xl mb-4">⏳</p>
                <p>Loading orders...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-lg">No orders found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => viewOrder(order)}
                    className={`card p-4 cursor-pointer transition ${
                      selectedOrder?.id === order.id
                        ? 'border-2 border-purple-500'
                        : 'hover:border-2 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xs text-gray-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer_phone}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-700 text-lg">
                          ₦{order.total_amount.toLocaleString()}
                        </p>
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-purple-500 mt-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Detail Panel */}
          {selectedOrder && (
            <div className="md:w-80 shrink-0">
              <div className="card p-6 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-purple-800">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <p className="text-gray-400">Order ID</p>
                    <p className="font-mono font-bold">
                      #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Customer</p>
                    <p className="font-semibold">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="font-semibold">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="font-semibold">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Delivery Address</p>
                    <p className="font-semibold">{selectedOrder.delivery_address}</p>
                  </div>
                  {selectedOrder.notes && (
                    <div>
                      <p className="text-gray-400">Notes</p>
                      <p className="font-semibold">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="font-bold text-purple-800 mb-3">Items Ordered</p>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product_name} x{item.quantity}
                        </span>
                        <span className="font-bold text-purple-700">
                          ₦{(item.unit_price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold text-purple-800">
                    <span>Total</span>
                    <span>₦{selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Jumia Fulfillment Reminder */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-yellow-800 mb-1">
                    📦 Fulfillment Reminder
                  </p>
                  <p className="text-xs text-yellow-700">
                    Go to Jumia and order these items to:
                  </p>
                  <p className="text-xs font-semibold text-yellow-800 mt-1">
                    {selectedOrder.delivery_address}
                  </p>
                </div>

              </div>
            </div>
          )}

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
