'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const cat = searchParams.get('category') || ''
    setSelectedCategory(cat)
    fetchCategories()
    updateCartCount()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchQuery])

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_active', true)

    if (selectedCategory) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', selectedCategory)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`)
    }

    const { data } = await query
    if (data) setProducts(data)
    setLoading(false)
  }

  const addToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((item: any) => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount()
    alert(`${product.name} added to cart!`)
  }

  const categoryIcons: any = {
    'food-groceries': '🥦',
    'beverages': '🥤',
    'household-cleaning': '🧹',
    'personal-care': '🧴',
    'perfumes-fragrances': '🌸',
    'baby-kids': '👶',
    'electronics': '📱',
    'fashion-clothing': '👗',
    'health-wellness': '💊',
    'stationery-office': '📚',
  }

  return (
    <div className="min-h-screen" style={{background: '#0a0a0a'}}>

      {/* Navbar */}
      <nav style={{background: 'linear-gradient(180deg, #0d0d1a 0%, rgba(13,13,26,0.95) 100%)', borderBottom: '1px solid rgba(124,58,237,0.3)'}} className="sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <h1 className="text-2xl font-black tracking-wider" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              ✦ FRESHMART
            </h1>
          </Link>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-2.5 rounded-full text-white outline-none text-sm"
                style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(124,58,237,0.4)'}}
              />
              <span className="absolute right-4 top-2.5 text-purple-400">🔍</span>
            </div>
          </div>
          <Link href="/cart" className="relative shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)'}}>
              <span className="text-lg">🛒</span>
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f6d365, #fda085)', color: '#1a1a2e'}}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">

        {/* Sidebar */}
        <div className="hidden sm:block w-52 shrink-0">
          <div className="card p-4 sticky top-24">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">Categories</p>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === ''
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={selectedCategory === '' ? {background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'} : {}}
              >
                🏪 All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={selectedCategory === cat.slug ? {background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'} : {}}
                >
                  {categoryIcons[cat.slug] || '📦'} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">
              {selectedCategory
                ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
                : 'All Products'}
            </h2>
            <span className="text-xs text-gray-500 px-3 py-1 rounded-full" style={{background: 'rgba(255,255,255,0.05)'}}>
              {products.length} items
            </span>
          </div>

          {/* Mobile Categories */}
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-4 mb-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === '' ? 'text-white' : 'text-gray-400'
              }`}
              style={selectedCategory === '' ? {background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'} : {background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.slug ? 'text-white' : 'text-gray-400'
                }`}
                style={selectedCategory === cat.slug ? {background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'} : {background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}
              >
                {categoryIcons[cat.slug]} {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">⏳</p>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-gray-400 text-lg mb-6">No products found.</p>
              <Link
                href="/admin"
                className="px-6 py-3 rounded-full font-bold text-white"
                style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'}}
              >
                Add Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="card p-3 group">
                  <div className="relative rounded-xl overflow-hidden mb-3" style={{background: 'rgba(124,58,237,0.1)', height: '160px'}}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    {product.compare_price && (
                      <div className="absolute top-2 left-2 badge text-xs">SALE</div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{background: 'rgba(0,0,0,0.6)'}}>
                        <span className="text-red-400 font-bold text-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-purple-400 mb-1">{product.categories?.name}</p>
                  <h3 className="font-semibold text-xs text-gray-200 mb-2 line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="price-tag text-sm font-black">
                      ₦{product.price.toLocaleString()}
                    </span>
                    {product.compare_price && (
                      <span className="text-gray-600 text-xs line-through">
                        ₦{product.compare_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)'}}
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : '+ Add to Cart'}
                  </button>
                </div>
              ))}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0a0a0a'}}>
        <p className="text-purple-400 text-xl">⏳ Loading...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
