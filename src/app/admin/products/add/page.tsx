'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
      compare_price: form.compare_price
        ? parseFloat(form.compare_price)
        : null,
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
            <Link href="/admin/orders" className="hover:underline">Orders</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin/products"
            className="text-purple-600 hover:underline text-sm"
          >
            ← Back to Products
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-purple-800 mb-6">
          ➕ Add New Product
        </h1>

        <div className="card p-6 space-y-4">

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Nivea Body Lotion 400ml"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 5000"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                Original Price (₦)
              </label>
              <input
                type="number"
                name="compare_price"
                value={form.compare_price}
                onChange={handleChange}
                placeholder="e.g. 6000"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">
              Category *
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={form.stock_quantity}
                onChange={handleChange}
                placeholder="e.g. 50"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
              >
                <option value="piece">Piece</option>
                <option value="kg">Kg</option>
                <option value="litre">Litre</option>
                <option value="pack">Pack</option>
                <option value="bottle">Bottle</option>
                <option value="carton">Carton</option>
                <option value="bag">Bag</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">
              Product Image URL
            </label>
            <input
              type="text"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste a direct image link from the web
            </p>
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
              <span className="text-sm font-semibold text-gray-600">
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
              <span className="text-sm font-semibold text-gray-600">
                ✅ Active (visible in store)
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-purple-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Adding Product...' : '➕ Add Product'}
          </button>

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
