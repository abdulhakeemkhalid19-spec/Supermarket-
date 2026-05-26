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
    <div className="min-h-screen bg-purple-50">

      {/* Navbar */}
      <nav className="bg-purple-800 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">🛒 FreshMart</Link>
          <div className="flex-1 mx-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-gray-800 outline-none"
            />
          </div>
          <Link href="/cart" className="relative">
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">

        {/* Sidebar Categories */}
        <div className="hidden sm:block w-48 shrink-0">
          <h3 className="font-bold text-purple-800 mb-3">Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === ''
                  ? 'bg-purple-700 text-white'
                  : 'hover:bg-purple-100 text-gray-700'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === cat.slug
                    ? 'bg-purple-700 text-white'
                    : 'hover:bg-purple-100 text-gray-700'
                }`}
              >
                {categoryIcons[cat.slug] || '📦'} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-purple-800">
              {selectedCategory
                ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
                : 'All Products'}
            </h2>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </div>

          {/* Mobile Category Scroll */}
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                selectedCategory === ''
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === cat.slug
                    ? 'bg-purple-700 text-white'
                    : 'bg-white text-gray-700 border'
                }`}
              >
                {categoryIcons[cat.slug]} {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-purple-400">
              <p className="text-5xl mb-4">⏳</p>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-lg">No products found.</p>
              <Link
                href="/admin"
                className="mt-4 inline-block bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800"
              >
                Add Products in Admin
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="card p-3">
                  <div className="bg-purple-100 rounded-lg h-36 flex items-center justify-center mb-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-1">
                    {product.categories?.name}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-700 font-bold text-sm">
                      ₦{product.price.toLocaleString()}
                    </span>
                    {product.compare_price && (
                      <span className="text-gray-400 text-xs line-through">
                        ₦{product.compare_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    Stock: {product.stock_quantity} {product.unit}s
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className="w-full bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-purple-700 text-xl">⏳ Loading products...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
