'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/AdminGuard'

export default function AIProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [productName, setProductName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    image_url: '',
    category_id: '',
    stock_quantity: '50',
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

  const generateWithAI = async () => {
    if (!productName.trim()) {
      alert('Please enter a product name!')
      return
    }
    setLoading(true)
    setGenerated(false)

    try {
      const prompt = `You are a Nigerian supermarket product expert. Generate product details for "${productName}" to be sold on a Nigerian online supermarket website called FreshMart.

Return ONLY a valid JSON object with these exact fields:
{
  "name": "full product name with brand and size if applicable",
  "description": "2-3 sentence product description highlighting key features and benefits",
  "price": number (realistic Nigerian Naira price customers would pay),
  "compare_price": number (original price, about 10-20% higher than price to show discount),
  "category": "one of: Food & Groceries, Beverages, Household & Cleaning, Personal Care, Perfumes & Fragrances, Baby & Kids, Electronics, Fashion & Clothing, Health & Wellness, Stationery & Office",
  "image_url": "a direct image URL from unsplash.com or similar free image site that shows this product"
}

Make the price realistic for Nigeria in 2024. Do not include any text outside the JSON.`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        }
      )

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      // Find matching category
      const matchedCategory = categories.find((cat) =>
        cat.name.toLowerCase().includes(parsed.category?.toLowerCase().split(' ')[0] || '')
      )

      setForm({
        name: parsed.name || productName,
        description: parsed.description || '',
        price: parsed.price?.toString() || '',
        compare_price: parsed.compare_price?.toString() || '',
        image_url: parsed.image_url || '',
        category_id: matchedCategory?.id || '',
        stock_quantity: '50',
        unit: 'piece',
        is_featured: false,
        is_active: true,
      })

      setGenerated(true)
    } catch (error) {
      alert('AI generation failed. Please try again or fill manually!')
      console.error(error)
    }

    setLoading(false)
  }

  const handleChange = (e: any) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id) {
      alert('Please fill in Name, Price and Category!')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      image_url: form.image_url || null,
      category_id: form.category_id,
      stock_quantity: parseInt(form.stock_quantity) || 50,
      unit: form.unit,
      is_featured: form.is_featured,
      is_active: form.is_active,
    })
    if (error) {
      alert('Error saving product!')
      console.error(error)
    } else {
      alert('✅ Product added successfully!')
      setProductName('')
      setForm({
        name: '',
        description: '',
        price: '',
        compare_price: '',
        image_url: '',
        category_id: '',
        stock_quantity: '50',
        unit: 'piece',
        is_featured: false,
        is_active: true,
      })
      setGenerated(false)
    }
    setSaving(false)
  }

  const handleSaveAndAnother = async () => {
    await handleSave()
    setProductName('')
    setGenerated(false)
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

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/admin/products" className="text-purple-400 hover:text-purple-300 text-sm transition">
              ← Back to Products
            </Link>
          </div>

          <div className="mb-8">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">AI Powered</p>
            <h1 className="text-3xl font-black text-white">AI Product Upload</h1>
            <p className="text-gray-400 text-sm mt-2">Type a product name and AI will fill everything automatically!</p>
          </div>

          {/* AI Input */}
          <div className="card p-6 mb-6">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
              🤖 Enter Product Name
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateWithAI()}
                placeholder="e.g. Samsung Galaxy A15, Indomie Noodles, Nike Sneakers..."
                className="flex-1 px-4 py-3 rounded-xl text-white outline-none text-sm"
                style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)'}}
              />
              <button
                onClick={generateWithAI}
                disabled={loading}
                className="px-6 py-3 rounded-xl font-black text-white transition hover:scale-105 disabled:opacity-40 shrink-0"
                style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'}}
              >
                {loading ? '⏳' : '🤖 Generate'}
              </button>
            </div>
            {loading && (
              <div className="mt-4 text-center">
                <p className="text-purple-400 text-sm animate-pulse">🤖 AI is generating product details...</p>
              </div>
            )}
          </div>

          {/* Generated Form */}
          {generated && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-lg">✅</span>
                <p className="text-green-400 font-bold text-sm">AI has filled in the details! Review and save.</p>
              </div>

              {/* Image Preview */}
              {form.image_url && (
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)'}}>
                  <img
                    src={form.image_url}
                    alt={form.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    onError={(e: any) => e.target.style.display = 'none'}
                  />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Image Preview</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{form.image_url}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Product Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={inputStyle} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Selling Price (₦)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Original Price (₦)</label>
                  <input type="number" name="compare_price" value={form.compare_price} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Category</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  style={{...inputStyle, background: '#1a1a2e'}}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={{background: '#1a1a2e'}}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Stock Quantity</label>
                  <input type="number" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} style={{...inputStyle, background: '#1a1a2e'}}>
                    {['piece', 'kg', 'litre', 'pack', 'bottle', 'carton', 'bag'].map((u) => (
                      <option key={u} value={u} style={{background: '#1a1a2e'}}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Image URL</label>
                <input type="text" name="image_url" value={form.image_url} onChange={handleChange} style={inputStyle} />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="w-4 h-4 accent-purple-700" />
                  <span className="text-sm font-semibold text-gray-400">⭐ Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-purple-700" />
                  <span className="text-sm font-semibold text-gray-400">✅ Active</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-4 rounded-xl font-black text-white transition hover:scale-105 disabled:opacity-40"
                  style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
                >
                  {saving ? '⏳ Saving...' : '✅ Save Product'}
                </button>
                <button
                  onClick={handleSaveAndAnother}
                  disabled={saving}
                  className="flex-1 py-4 rounded-xl font-black text-white transition hover:scale-105 disabled:opacity-40"
                  style={{background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399'}}
                >
                  {saving ? '⏳ Saving...' : '➕ Save & Add Another'}
                </button>
              </div>

            </div>
          )}

          {/* Tips */}
          {!generated && !loading && (
            <div className="card p-6" style={{background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(76,29,149,0.05))', border: '1px solid rgba(124,58,237,0.2)'}}>
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">💡 Tips</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Be specific: <span className="text-purple-300">"Samsung Galaxy A15 128GB"</span> works better than <span className="text-red-400">"phone"</span></p>
                <p>• Include brand: <span className="text-purple-300">"Nivea Men Body Wash 500ml"</span></p>
                <p>• For food: <span className="text-purple-300">"Indomie Instant Noodles Chicken Flavor"</span></p>
                <p>• For fashion: <span className="text-purple-300">"Nike Air Force 1 White Sneakers"</span></p>
                <p>• Press <span className="text-purple-300">Enter</span> or click Generate after typing</p>
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
    </AdminGuard>
  )
}
