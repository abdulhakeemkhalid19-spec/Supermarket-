'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
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
    fetchProduct()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setForm({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        compare_price: data.compare_price?.toString() || '',
        image_url: data.image_url || '',
        category_id: data.category_id || '',
        stock_quantity: data.stock_quantity?.toString() || '',
        unit: data.unit || 'piece',
        is_featured: data.is_featured || false,
        is_active: data.is_active ?? true,
      })
    }
    setFetching(false)
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

    const { error } = await supabase
      .from('products')
      .update({
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
      .eq('id', id)

    if (error) {
      alert('Error updating product. Please try again!')
      console.error(error)
    } else {
      alert('Product updated successfully! ✅')
      router.push('/admin/products')
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${form.name}"? This cannot be undone!`)) return

    setLoading(true)

    // Delete order items with this product first
    await supabase
      .from('order_items')
      .delete()
      .eq('product_id', id)

    // Delete stock movements
    await supabase
      .from('stock_movements')
      .delete()
      .eq('product_id', id)

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting product. Please try again!')
      console.error(error)
    } else {
      alert('Product deleted successfully!')
      router.push('/admin/products')
    }

    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-purple-700 text-xl">⏳ Loading product...</p>
      </div>
    )
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
          ✏️ Edit Product
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
            {form.image_url && (
              <img
                src={form.image_url}
                alt="Preview"
                className="mt-2 h-24 rounded-lg object-cover"
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
            {loading ? '⏳ Saving...' : '✅ Save Changes'}
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            🗑️ Delete Product
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
