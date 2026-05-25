'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [categories, setCategories] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchFeaturedProducts()
    updateCartCount()
  }, [])

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(8)
    if (data) setFeaturedProducts(data)
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
          <Link href="/" className="text-2xl font-bold tracking-tight">
            🛒 FreshMart
          </Link>
          <div className="flex-1 mx-4 hidden sm:block">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-gray-800 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-sm hover:underline hidden sm:block">
              All Products
            </Link>
            <Link href="/cart" className="relative">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        {/* Mobile Search */}
        <div className="sm:hidden px-4 pb-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-gray-800 outline-none"
          />
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            Welcome to FreshMart 🛍️
          </h1>
          <p className="text-purple-200 text-lg mb-6">
            Shop groceries, perfumes, electronics & more — delivered to your door!
          </p>
          <Link
            href="/products"
            className="bg-yellow-400 text-purple-900 font-bold px-8 py-3 rounded-full text-lg hover:bg-yellow-300 transition"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-purple-800 mb-6">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="card p-4 text-center cursor-pointer"
            >
              <div className="text-4xl mb-2">
                {categoryIcons[cat.slug] || '📦'}
              </div>
              <p className="text-sm font-semibold text-purple-800">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-6">
          Featured Products
        </h2>
        {featuredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg">No featured products yet.</p>
            <p>Add products from the admin panel!</p>
            <Link
              href="/admin"
              className="mt-4 inline-block bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card p-3">
                <div className="bg-purple-100 rounded-lg h-40 flex items-center justify-center mb-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-5xl">📦</span>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-700 font-bold">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.compare_price && (
                    <span className="text-gray-400 text-xs line-through">
                      ₦{product.compare_price.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-800 transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-purple-900 text-purple-200 mt-16 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-2xl font-bold text-white mb-2">🛒 FreshMart</p>
          <p className="text-sm mb-4">Your trusted online supermarket</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/products" className="hover:text-white">Products</Link>
            <Link href="/cart" className="hover:text-white">Cart</Link>
            <Link href="/orders" className="hover:text-white">My Orders</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
          </div>
          <p className="text-xs mt-6 text-purple-400">
            © 2024 FreshMart. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}
