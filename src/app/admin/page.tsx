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
        totalRevenue: orders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.total_amount, 0),
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
    await supabase.from('orders').update({ status }).eq('id', orderId)
    fetchRecentOrders()
    fetchStats()
  }

  const statusColors: any = {
    pending: {bg: 'rgba(246,211,101,0.15)', color: '#f6d365'},
    confirmed: {bg: 'rgba(96,165,250,0.15)', color: '#60a5fa'},
    processing: {bg: 'rgba(167,139,250,0.15)', color: '#a78bfa'},
    shipped: {bg: 'rgba(99,102,241,0.15)', color: '#818cf8'},
    delivered: {bg: 'rgba(52,211,153,0.15)', color: '#34d399'},
    cancelled: {bg: 'rgba(248,113,113,0.15)', color: '#f87171'},
  }

  const navStyle = {
    background: 'linear-gradient(180deg, #0d0d1a 0%, rgba(13,13,26,0.95) 100%)',
    borderBottom: '1px solid rgba(124,58,237,0.3)'
  }

  return (
    <div className="min-h-screen" style={{background: '#0a0a0a'}}>

      {/* Navbar */}
      <nav style={navStyle} className="sticky top-0 z-50 shadow-2xl">
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
              {href: '/admin/products', label: 'Products'},
              {href: '/admin/orders', label: 'Orders'},
              {href: '/admin/stock', label: 'Stock'},
              {href: '/', label: 'View Store'},
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
          <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Overview</p>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {icon: '📦', value: stats.totalOrders, label: 'Total Orders', color: '#a78bfa'},
            {icon: '⏳', value: stats.pendingOrders, label: 'Pending Orders', color: '#f6d365'},
            {icon: '🛍️', value: stats.totalProducts, label: 'Total Products', color: '#34d399'},
            {icon: '💰', value: `₦${stats.totalRevenue.toLocaleString()}`, label: 'Total Revenue', color: '#fda085'},
          ].map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-black mb-1" style={{color: stat.color}}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {href: '/admin/products/add', icon: '➕', label: 'Add Product'},
            {href: '/admin/products', icon: '📋', label: 'Manage Products'},
            {href: '/admin/orders', icon: '🚚', label: 'Manage Orders'},
            {href: '/admin/stock', icon: '📦', label: 'Manage Stock'},
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card p-5 text-center group hover:scale-105 transition-transform"
            >
              <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</p>
              <p className="text-sm font-bold text-gray-300 group-hover:text-purple-300 transition-colors">
                {action.label}
              </p>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Latest</p>
              <h2 className="text-xl font-black text-white">Recent Orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold px-4 py-2 rounded-full transition hover:scale-105"
              style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa'}}
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-gray-600 py-8">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-gray-500">No orders yet. Share your store link!</p>
              <p className="text-purple-400 font-bold mt-2">vansupermarket.vercel.app</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                    {['Order ID', 'Customer', 'Phone', 'Amount', 'Status', 'Action'].map((h) => (
                      <th key={h} className="text-left py-3 pr-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} style={{borderBottom: '1px solid rgba(255,255,255,0.03)'}} className="hover:bg-white hover:bg-opacity-5 transition">
                      <td className="py-4 pr-4 font-mono text-xs text-gray-500">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 pr-4 font-bold text-gray-200">
                        {order.customer_name}
                      </td>
                      <td className="py-4 pr-4 text-gray-500 text-xs">
                        {order.customer_phone}
                      </td>
                      <td className="py-4 pr-4 font-black price-tag">
                        ₦{order.total_amount.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="px-2 py-1 rounded-full text-xs font-black uppercase" style={{
                          background: statusColors[order.status]?.bg || 'rgba(255,255,255,0.1)',
                          color: statusColors[order.status]?.color || 'white'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs rounded-lg px-2 py-1 outline-none font-semibold"
                          style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa'}}
                        >
                          {['pending','confirmed','processing','shipped','delivered','cancelled'].map((s) => (
                            <option key={s} value={s} style={{background: '#1a1a2e'}}>{s}</option>
                          ))}
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
