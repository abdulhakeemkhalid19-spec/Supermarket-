'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/AdminGuard'

export default function BulkImportPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [preview, setPreview] = useState<any[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const parseProducts = () => {
    if (!bulkText.trim()) {
      alert('Please enter product details!')
      return
    }
    if (!selectedCategory) {
      alert('Please select a category!')
      return
    }

    const lines = bulkText.trim().split('\n')
    const parsed = lines
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split(',')
        return {
          name: parts[0]?.trim() || '',
          price: parseFloat(parts[1]?.trim()) || 0,
          compare_price: parseFloat(parts[2]?.trim()) || null,
          image_url: parts[3]?.trim() || '',
          stock_quantity: parseInt(parts[4]?.trim()) || 10,
        }
      })
      .filter((p) => p.name && p.price > 0)

    setPreview(parsed)
  }

  const handleImport = async () => {
    if (preview.length === 0) {
      alert('Please parse products first!')
      return
    }
    setLoading(true)
    const products = preview.map((p) => ({
      ...p,
      category_id: selectedCategory,
      unit: 'piece',
      is_active: true,
      is_featured: false,
    }))

    const { error } = await supabase.from('products').insert(products)
    if (error) {
      alert('Error importing products!')
      console.error(error)
    } else {
      alert(`✅ ${products.length} products imported successfully!`)
      router.push('/admin/products')
    }
    setLoading(false)
  }

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
                {href: '/admin/orders', label: 'Orders'},
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-400 hover:text-white transition font-medium hidden sm:block">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/admin/products" className="text-purple-400 hover:text-purple-300 text-sm transition">
              ← Back to Products
            </Link>
          </div>
          <div className="mb-8">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Bulk Import</p>
            <h1 className="text-3xl font-black text-white">Import Multiple Products</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Input */}
            <div className="card p-6">
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
                Paste Products
              </p>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none text-sm"
                  style={{background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)'}}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={{background: '#1a1a2e'}}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Products (one per line)
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={10}
                  placeholder={`Format: Name, Price, OriginalPrice, ImageURL, Stock\n\nExample:\niPhone 15 Case, 5000, 7000, https://image.jpg, 20\nSamsung Earbuds, 15000, 18000, https://image.jpg, 15\nNike Sneakers, 45000, 55000, https://image.jpg, 10`}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none text-sm"
                  style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)'}}
                />
              </div>

              <button
                onClick={parseProducts}
                className="w-full py-3 rounded-xl font-bold text-white transition hover:scale-105"
                style={{background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)'}}
              >
                👁️ Preview Products
              </button>
            </div>

            {/* Preview */}
            <div className="card p-6">
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
                Preview ({preview.length} products)
              </p>

              {preview.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-4xl mb-3">👁️</p>
                  <p className="text-sm">Paste products and click Preview</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                  {preview.map((p, i) => (
                    <div key={i} className="p-3 rounded-xl flex items-center gap-3" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'}}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{background: 'rgba(124,58,237,0.15)'}}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" onError={(e: any) => e.target.style.display='none'} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-sm">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-200 line-clamp-1">{p.name}</p>
                        <p className="text-xs price-tag font-black">₦{p.price.toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-gray-500 shrink-0">Stock: {p.stock_quantity}</p>
                    </div>
                  ))}
                </div>
              )}

              {preview.length > 0 && (
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-black text-white transition hover:scale-105 disabled:opacity-40"
                  style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
                >
                  {loading ? '⏳ Importing...' : `✅ Import ${preview.length} Products`}
                </button>
              )}
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
    </AdminGuard>
  )
}
