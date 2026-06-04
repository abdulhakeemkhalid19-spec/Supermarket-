'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminGuard from '@/components/AdminGuard'

const UNSPLASH_IMAGES: any = {
  electronics: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  food: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500',
  fashion: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  clothing: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500',
  fragrance: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500',
  grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
  baby: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
  health: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
  cleaning: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500',
  beverage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
}

function getImageForProduct(name: string, category: string): string {
  const combined = (name + ' ' + category).toLowerCase()
  for (const key of Object.keys(UNSPLASH_IMAGES)) {
    if (combined.includes(key)) return UNSPLASH_IMAGES[key]
  }
  return UNSPLASH_IMAGES.default
}

export default function AIProductPage() {
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

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    if (!apiKey) {
      alert('OpenRouter API key is missing!')
      return
    }

    setLoading(true)
    setGenerated(false)

    try {
      const prompt = [
        'Generate product details for a Nigerian supermarket.',
        'Product: ' + productName,
        'Return ONLY a JSON object with these fields:',
        'name, description, price (Naira number), compare_price (15% higher number), category',
        'Category must be one of: Food and Groceries, Beverages, Household and Cleaning, Personal Care, Perfumes and Fragrances, Baby and Kids, Electronics, Fashion and Clothing, Health and Wellness, Stationery and Office',
        'Return only the JSON with no other text or explanation.',
      ].join(' ')

      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
            'HTTP-Referer': 'https://vansupermarket.vercel.app',
            'X-Title': 'FreshMart',
          },
          body: JSON.stringify({
            model: 'openrouter/auto',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 400,
            temperature: 0.7,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error('API error ' + response.status + ': ' + JSON.stringify(errorData))
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ''
      console.log('AI Response:', text)

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const parsed = JSON.parse(jsonMatch[0])

      const matchedCategory = categories.find((cat) =>
        cat.name.toLowerCase().includes(
          (parsed.category || '').toLowerCase().split(' ')[0]
        )
      )

      const imageUrl = getImageForProduct(productName, parsed.category || '')

      setForm({
        name: parsed.name || productName,
        description: parsed.description || '',
        price: parsed.price?.toString() || '',
        compare_price: parsed.compare_price?.toString() || '',
        image_url: imageUrl,
        category_id: matchedCategory?.id || '',
        stock_quantity: '50',
        unit: 'piece',
        is_featured: false,
        is_active: true,
      })

      setGenerated(true)
    } catch (error: any) {
      console.error('AI Error:', error)
      alert('AI generation failed: ' + error.message)
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
      alert('Error saving product: ' + error.message)
    } else {
      alert('Product added successfully!')
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
              Back to Products
            </Link>
          </div>
          <div className="mb-8">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">AI Powered</p>
            <h1 className="text-3xl font-black text-white">AI Product Upload</h1>
            <p className="text-gray-400 text-sm mt-2">Type a product name and AI will fill everything automatically!</p>
          </div>

          <div className="card p-6 mb-6">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">Enter Product Name</p>
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
              <p className="text-purple-400 text-sm mt-4 text-center animate-pulse">AI is generating product details...</p>
            )}
          </div>

          {generated && (
            <div className="card p-6 space-y-5">
              <p className="text-green-400 font-bold text-sm">✅ AI has filled in the details! Review and save.</p>

              {form.image_url && (
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{background: 'rgba(124,58,237,0.1)'}}>
                  <img src={form.image_url} alt={form.name} className="w-20 h-20 rounded-xl object-cover" onError={(e: any) => e.target.style.display = 'none'} />
                  <p className="text-xs text-gray-400">Image Preview</p>
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
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Selling Price</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Original Price</label>
                  <input type="number" name="compare_price" value={form.compare_price} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} style={{...inputStyle, background: '#1a1a2e'}}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={{background: '#1a1a2e'}}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Stock</label>
                  <input type="number" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} style={{...inputStyle, background: '#1a1a2e'}}>
                    {['piece','kg','litre','pack','bottle','carton','bag'].map((u) => (
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
                  <span className="text-sm text-gray-400">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 accent-purple-700" />
                  <span className="text-sm text-gray-400">Active</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="flex-1 py-4 rounded-xl font-black text-white transition hover:scale-105 disabled:opacity-40" style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'}}>
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
                <button onClick={handleSaveAndAnother} disabled={saving} className="flex-1 py-4 rounded-xl font-black transition hover:scale-105 disabled:opacity-40" style={{background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399'}}>
                  {saving ? 'Saving...' : 'Save and Add Another'}
                </button>
              </div>
            </div>
          )}

          {!generated && !loading && (
            <div className="card p-6" style={{background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(76,29,149,0.05))', border: '1px solid rgba(124,58,237,0.2)'}}>
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">Tips</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Be specific: Samsung Galaxy A15 128GB</p>
                <p>Include brand: Nivea Men Body Wash 500ml</p>
                <p>For food: Indomie Instant Noodles Chicken Flavor</p>
                <p>Press Enter or click Generate after typing</p>
              </div>
            </div>
          )}
        </div>

        <footer style={{background: '#0d0d1a', borderTop: '1px solid rgba(124,58,237,0.2)'}} className="py-12 px-4 mt-16">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-2" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              ✦ FRESHMART
            </h2>
            <p className="text-gray-700 text-xs">2024 FreshMart. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AdminGuard>
  )
      }
