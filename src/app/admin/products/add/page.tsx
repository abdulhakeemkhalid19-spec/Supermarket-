'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/AdminGuard'

export default function AddProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    image_url: '',
    category_id: '',
    stock_quantity: '',
    unit: 'piece',
    is_featured: false,
    is_active: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const handleChange = (e: any) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category_id) {
      alert('Please fill in Name, Price and Category!')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      image_url: form.image_url || null,
      category_id: form.category_id,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      unit: form.unit,
      is_featured: form.is_featured,
      is_active: form.is_active,
    })
    if (error) {
      alert('Error adding product. Please try again!')
      console.error(error)
    } else {
      alert('Product added successfully! ✅')
      router.push('/admin/products')
    }
    setLoading(false)
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

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/admin/products" className="text-purple-400 hover:text-purple-300 text-sm transition">
              ← Back to Products
            </Link>
          </div>
          <div className="mb-8">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">New Item</p>
            <h1 className="text-3xl font-black text-white">Add Product</h1>
          </div>

          <div className="card p-6 space-y-5">

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Nivea Body Lotion 400ml"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                rows={3}
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Selling Price (₦) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Original Price (₦)
                </label>
                <input
                  type="number"
                  name="compare_price"
                  value={form.compare_price}
                  onChange={handleChange}
                  placeholder="e.g. 6000"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                Category *
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                style={{...inputStyle, background: '#1a1a2e'}}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} style={{background: '#1a1a2e'}}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                  Unit
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  style={{...inputStyle, background: '#1a1a2e'}}
                >
                  {['piece','kg','litre','pack','bottle','carton','bag'].map((u) => (
                    <option key={u} value={u} style={{background: '#1a1a2e'}}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                Product Image URL
              </label>
              <input
                type="text"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                style={inputStyle}
              />
              <p className="text-xs text-gray-600 mt-2">
                💡 Tip: Right click any product image on Google → Copy image address
              </p>
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="mt-3 h-32 rounded-xl object-cover"
                  onError={(e: any) => e.target.style.display = 'none'}
                />
              )}
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-purple-700"
                />
                <span className="text-sm font-semibold text-gray-400">
                  ⭐ Featured Product
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-purple-700"
                />
                <span className="text-sm font-semibold text-gray-400">
                  ✅ Active
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
            >
              {loading ? '⏳ Adding Product...' : '➕ Add Product'}
            </button>

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
