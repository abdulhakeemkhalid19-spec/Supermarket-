'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentOrders()
  }, [])

  const fetchStats = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total_amount')

    const { data: products } = await supabase
      .from('products')
      .select('id')

    if (orders) {
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        totalProducts: products?.length || 0,
        totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
      })
    }
    setLoading(false)
  }

  const fetchRecentOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) setRecentOrders(data)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    fetchRecentOrders()
    fetchStats()
  }

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

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
            <Link href="/admin/products" className="hover:underline">
              Products
            </Link>
            <Link href="/admin/orders" className="hover:underline">
              Orders
            </Link>
            <Link href="/" className="hover:underline">
              View Store
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-purple-800 mb-6">
          📊 Admin Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <p className="text-3xl mb-1">📦</p>
            <p className="text-2xl font-bold text-purple-800">
              {stats.totalOrders}
            </p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl mb-1">⏳</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pendingOrders}
            </p>
            <p className="text-sm text-gray-500">Pending Orders</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl mb-1">🛍️</p>
            <p className="text-2xl font-bold text-purple-800">
              {stats.totalProducts}
            </p>
            <p className="text-sm text-gray-500">Total Products</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl mb-1">💰</p>
            <p className="text-2xl font-bold text-green-600">
              ₦{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/products/add"
            className="card p-4 text-center hover:bg-purple-50 cursor-pointer"
          >
            <p className="text-3xl mb-1">➕</p>
            <p className="text-sm font-semibold text-purple-800">Add Product</p>
          </Link>
          <Link
            href="/admin/products"
            className="card p-4 text-center hover:bg-purple-50 cursor-pointer"
          >
            <p className="text-3xl mb-1">📋</p>
            <p className="text-sm font-semibold text-purple-800">Manage Products</p>
          </Link>
          <Link
            href="/admin/orders"
            className="card p-4 text-center hover:bg-purple-50 cursor-pointer"
          >
            <p className="text-3xl mb-1">🚚</p>
            <p className="text-sm font-semibold text-purple-800">Manage Orders</p>
          </Link>
          <Link
            href="/admin/stock"
            className="card p-4 text-center hover:bg-purple-50 cursor-pointer"
          >
            <p className="text-3xl mb-1">📦</p>
            <p className="text-sm font-semibold text-purple-800">Manage Stock</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-purple-800">
              🕐 Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-purple-600 hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p>No orders yet. Share your store link!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2 pr-4">Order ID</th>
                    <th className="text-left py-2 pr-4">Customer</th>
                    <th className="text-left py-2 pr-4">Phone</th>
                    <th className="text-left py-2 pr-4">Amount</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-purple-50">
                      <td className="py-3 pr-4 font-mono text-xs">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 pr-4 font-semibold">
                        {order.customer_name}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {order.customer_phone}
                      </td>
                      <td className="py-3 pr-4 font-bold text-purple-700">
                        ₦{order.total_amount.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-purple-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
