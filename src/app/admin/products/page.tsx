'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ManageProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    fetchProducts()
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_featured: !current }).eq('id', id)
    fetchProducts()
  }

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    await supabase.from('order_items').delete().eq('product_id', id)
    await supabase.from('stock_movements').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              {href: '/admin', label: 'Dashboard'},
              {href: '/admin/orders', label: 'Orders'},
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Inventory</p>
            <h1 className="text-3xl font-black text-white">Manage Products</h1>
          </div>
          <Link
            href="/admin/products/add"
            className="px-5 py-2.5 rounded-full font-bold text-white text-sm transition hover:scale-105"
            style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 4px 15px rgba(124,58,237,0.4)'}}
          >
            ➕ Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="card p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-white outline-none text-sm"
              style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)'}}
            />
            <span className="absolute right-4 top-3 text-purple-400">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⏳</p>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-400 text-lg mb-6">No products found.</p>
            <Link
              href="/admin/products/add"
              className="px-8 py-3 rounded-full font-bold text-white"
              style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'}}
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(124,58,237,0.05)'}}>
                    {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Active', 'Actions'].map((h) => (
                      <th key={h} className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      style={{borderBottom: '1px solid rgba(255,255,255,0.03)'}}
                      className="hover:bg-white hover:bg-opacity-5 transition"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{background: 'rgba(124,58,237,0.15)'}}>
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span>📦</span>
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-gray-200 line-clamp-1 max-w-32">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500 text-xs">
                        {product.categories?.name || '-'}
                      </td>
                      <td className="py-4 px-4 font-black price-tag">
                        ₦{product.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-bold text-sm ${
                          product.stock_quantity === 0
                            ? 'text-red-400'
                            : product.stock_quantity < 5
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}>
                          {product.stock_quantity}
                        </span>
                        <span className="text-gray-600 text-xs ml-1">{product.unit}s</span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleFeatured(product.id, product.is_featured)}
                          className="px-3 py-1 rounded-full text-xs font-bold transition hover:scale-105"
                          style={product.is_featured
                            ? {background: 'rgba(246,211,101,0.15)', color: '#f6d365'}
                            : {background: 'rgba(255,255,255,0.05)', color: '#6b7280'}
                          }
                        >
                          {product.is_featured ? '⭐ Yes' : 'No'}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleActive(product.id, product.is_active)}
                          className="px-3 py-1 rounded-full text-xs font-bold transition hover:scale-105"
                          style={product.is_active
                            ? {background: 'rgba(52,211,153,0.15)', color: '#34d399'}
                            : {background: 'rgba(248,113,113,0.15)', color: '#f87171'}
                          }
                        >
                          {product.is_active ? '✅ Active' : '❌ Hidden'}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-xs font-bold transition hover:scale-105"
                            style={{color: '#a78bfa'}}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteProduct(product.id, product.name)}
                            className="text-xs font-bold text-red-500 hover:text-red-400 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
