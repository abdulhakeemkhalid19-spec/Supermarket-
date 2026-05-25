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
    await supabase
      .from('products')
      .update({ is_active: !current })
      .eq('id', id)
    fetchProducts()
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase
      .from('products')
      .update({ is_featured: !current })
      .eq('id', id)
    fetchProducts()
  }

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Link href="/admin/orders" className="hover:underline">Orders</Link>
            <Link href="/admin/stock" className="hover:underline">Stock</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-800">
            📋 Manage Products
          </h1>
          <Link
            href="/admin/products/add"
            className="bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition text-sm"
          >
            ➕ Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="card p-4 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-purple-400">
            <p className="text-5xl mb-4">⏳</p>
            <p>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg mb-4">No products found.</p>
            <Link
              href="/admin/products/add"
              className="bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-50">
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Stock</th>
                    <th className="text-left py-3 px-4">Featured</th>
                    <th className="text-left py-3 px-4">Active</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-purple-50 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-800 line-clamp-1">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {product.categories?.name || '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-purple-700">
                        ₦{product.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            product.stock_quantity === 0
                              ? 'text-red-500'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock_quantity} {product.unit}s
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            toggleFeatured(product.id, product.is_featured)
                          }
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            product.is_featured
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {product.is_featured ? '⭐ Yes' : 'No'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            toggleActive(product.id, product.is_active)
                          }
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.is_active ? '✅ Active' : '❌ Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-purple-600 hover:underline text-xs font-semibold"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() =>
                              deleteProduct(product.id, product.name)
                            }
                            className="text-red-400 hover:text-red-600 text-xs font-semibold"
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
      <footer className="bg-purple-900 text-purple-200 mt-16 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-2xl font-bold text-white mb-2">🛒 FreshMart</p>
          <p className="text-sm">© 2024 FreshMart. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
