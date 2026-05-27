'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    setUser(user)
    fetchProfile(user.id)
    fetchOrders(user.email || '', user.created_at)
  }

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile(data)
      setEditForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
      })
    }
    setLoading(false)
  }

  const fetchOrders = async (email: string, createdAt: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_email', email)
      .order('created_at', { ascending: false })
    if (data) {
      const accountCreated = new Date(createdAt)
      const filtered = data.filter(
        (order) => new Date(order.created_at) >= accountCreated
      )
      setOrders(filtered)
    }
  }

  const updateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update(editForm)
      .eq('id', user.id)
    if (error) {
      alert('Error updating profile!')
    } else {
      alert('Profile updated successfully! ✅')
      fetchProfile(user.id)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const statusColors: any = {
    pending: { bg: 'rgba(246,211,101,0.15)', color: '#f6d365' },
    confirmed: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
    processing: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
    shipped: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    delivered: { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
    cancelled: { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0a0a0a'}}>
        <p className="text-purple-400 text-xl">⏳ Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: '#0a0a0a'}}>

      {/* Navbar */}
      <nav style={{background: 'linear-gradient(180deg, #0d0d1a 0%, rgba(13,13,26,0.95) 100%)', borderBottom: '1px solid rgba(124,58,237,0.3)'}} className="sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-black tracking-wider" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              ✦ FRESHMART
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-sm text-purple-300 hover:text-white transition hidden sm:block">
              Shop
            </Link>
            <Link href="/cart" className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)'}}>
                <span className="text-lg">🛒</span>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs px-4 py-2 rounded-full font-bold transition hover:scale-105"
              style={{background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171'}}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="card p-6 mb-6" style={{background: 'linear-gradient(135deg, #1a0533, #0d0d1a)', border: '1px solid rgba(124,58,237,0.4)'}}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black" style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'}}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <div>
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase">Welcome back</p>
              <h1 className="text-2xl font-black text-white">{profile?.full_name || 'Customer'}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {icon: '📦', value: orders.length, label: 'Total Orders'},
            {icon: '🚚', value: orders.filter(o => o.status === 'shipped').length, label: 'Shipped'},
            {icon: '✅', value: orders.filter(o => o.status === 'delivered').length, label: 'Delivered'},
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['orders', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-2.5 rounded-full text-sm font-bold capitalize transition hover:scale-105"
              style={activeTab === tab
                ? {background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: 'white'}
                : {background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280'}
              }
            >
              {tab === 'orders' ? '📦 My Orders' : '👤 My Profile'}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-400 text-lg mb-6">No orders yet.</p>
                <Link
                  href="/products"
                  className="px-8 py-3 rounded-full font-bold text-white inline-block transition hover:scale-105"
                  style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'}}
                >
                  Start Shopping →
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-mono text-xs text-gray-500">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase" style={{
                      background: statusColors[order.status]?.bg,
                      color: statusColors[order.status]?.color,
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.product_name} x{item.quantity}</span>
                        <span className="font-bold price-tag">
                          ₦{(item.unit_price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3" style={{borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                    <div>
                      <p className="text-xs text-gray-500">Delivery to</p>
                      <p className="text-sm text-gray-300 font-medium">{order.delivery_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-black price-tag text-lg">
                        ₦{order.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card p-6">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
              Edit Profile
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Default Delivery Address
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  rows={3}
                  style={inputStyle}
                />
              </div>
              <button
                onClick={updateProfile}
                className="w-full py-4 rounded-xl font-black text-white transition hover:scale-105"
                style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
              >
                ✅ Save Changes
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
