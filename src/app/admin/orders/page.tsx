'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminGuard from '@/components/AdminGuard'

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
    await supabase.from('orders').update({ status }).eq('id', orderId)
    fetchOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status })
    }
  }

  const statusColors: any = {
    pending: { bg: 'rgba(246,211,101,0.15)', color: '#f6d365' },
    confirmed: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
    processing: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
    shipped: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    delivered: { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
    cancelled: { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
  }

  const filtered = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders

  return (
    <AdminGuard>
      <div className="min-h-screen" style={{background: '#0a0a0a'}}>

        {/* Navbar */}
        <nav style={{background: 'linear-gradient(180deg, #0d0d1a 0%, rgba(13,13,26,0.95) 100%)', borderBottom: '1px solid rgba(124,58,237,0.3)'}} className="sticky top-0 z-50 shadow-2xl">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <h1 className="text-xl font-black tracking-wider" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  ✦ FRESHMART
                </h1>
              </Link>
              <span className="text-xs px-3 py-1 rounded-full font-bold" style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa'}}>
                ADMIN
              </span>
            </div>
            <div className="flex items-center gap-5 text-sm">
              {[
                {href: '/admin', label: 'Dashboard'},
                {href: '/admin/products', label: 'Products'},
                {href: '/admin/stock', label: 'Stock'},
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-400 hover:text-white transition font-medium hidden sm:block">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Management</p>
            <h1 className="text-3xl font-black text-white">Manage Orders</h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="shrink-0 px-4 py-2 rounded-full text-xs font-bold capitalize transition hover:scale-105"
                style={filterStatus === status
                  ? {background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: 'white'}
                  : {background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280'}
                }
              >
                {status === '' ? 'All Orders' : status}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-6">

            {/* Orders List */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">⏳</p>
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">📭</p>
                  <p className="text-gray-400 text-lg">No orders found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => viewOrder(order)}
                      className="card p-5 cursor-pointer transition hover:scale-100"
                      style={selectedOrder?.id === order.id
                        ? {border: '1px solid rgba(124,58,237,0.6)'}
                        : {}
                      }
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-xs text-gray-500">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase" style={{
                          background: statusColors[order.status]?.bg,
                          color: statusColors[order.status]?.color,
                        }}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-black text-white">{order.customer_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.customer_phone}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-NG', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black price-tag text-lg">
                            ₦{order.total_amount.toLocaleString()}
                          </p>
                          <select
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs rounded-lg px-2 py-1 outline-none font-semibold mt-2"
                            style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa'}}
                          >
                            {['pending','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
                              <option key={s} value={s} style={{background: '#1a1a2e'}}>{s}</option>
                            ))}
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
                <div className="card p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-purple-400 text-xs font-bold tracking-widest uppercase">
                      Order Details
                    </p>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-600 hover:text-white transition text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 mb-5">
                    {[
                      {label: 'Order ID', value: `#${selectedOrder.id.slice(0, 8).toUpperCase()}`},
                      {label: 'Customer', value: selectedOrder.customer_name},
                      {label: 'Email', value: selectedOrder.customer_email},
                      {label: 'Phone', value: selectedOrder.customer_phone},
                      {label: 'Address', value: selectedOrder.delivery_address},
                      {label: 'Notes', value: selectedOrder.notes || 'None'},
                    ].map((item) => (
                      <div key={item.label} style={{borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px'}}>
                        <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-200">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{borderTop: '1px solid rgba(124,58,237,0.2)'}} className="pt-4 mb-4">
                    <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-3">
                      Items Ordered
                    </p>
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-400 line-clamp-1 flex-1 mr-2">
                            {item.product_name} x{item.quantity}
                          </span>
                          <span className="font-black price-tag shrink-0">
                            ₦{(item.unit_price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{borderTop: '1px solid rgba(255,255,255,0.05)'}} className="mt-3 pt-3 flex justify-between font-black">
                      <span className="text-white">Total</span>
                      <span className="price-tag">₦{selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Jumia Fulfillment Reminder */}
                  <div className="rounded-xl p-4" style={{background: 'rgba(246,211,101,0.08)', border: '1px solid rgba(246,211,101,0.2)'}}>
                    <p className="text-xs font-black mb-1" style={{color: '#f6d365'}}>
                      📦 Fulfillment Reminder
                    </p>
                    <p className="text-xs text-gray-400 mb-2">
                      Order these items on Jumia and deliver to:
                    </p>
                    <p className="text-xs font-bold text-white">
                      {selectedOrder.delivery_address}
                    </p>
                  </div>

                </div>
              </div>
            )}

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
    </AdminGuard>
  )
                      }
