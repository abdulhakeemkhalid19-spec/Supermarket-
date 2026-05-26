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
    <div className="min-h-screen" style={{background: '#0a0a0a'}}>

      {/* Navbar */}
      <nav style={{background: 'linear-gradient(180deg, #0d0d1a 0%, rgba(13,13,26,0.95) 100%)', borderBottom: '1px solid rgba(124,58,237,0.3)'}} className="sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <h1 className="text-2xl font-black tracking-wider" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              ✦ FRESHMART
            </h1>
          </Link>
          <div className="flex-1 hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search luxury products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-2.5 rounded-full text-white outline-none text-sm"
                style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(124,58,237,0.4)'}}
              />
              <span className="absolute right-4 top-2.5 text-purple-400">🔍</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/products" className="text-sm text-purple-300 hover:text-white transition hidden sm:block font-medium">
              Shop
            </Link>
            <Link href="/cart" className="relative">
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
        </div>
        {/* Mobile Search */}
        <div className="sm:hidden px-4 pb-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-full text-white outline-none text-sm"
            style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(124,58,237,0.4)'}}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0533 50%, #0d0d1a 100%)', minHeight: '85vh', display: 'flex', alignItems: 'center'}}>
        {/* Background circles */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20" style={{background: 'radial-gradient(circle, #7c3aed, transparent)', filter: 'blur(60px)'}}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-15" style={{background: 'radial-gradient(circle, #f6d365, transparent)', filter: 'blur(80px)'}}></div>

        <div className="max-w-6xl mx-auto px-4 py-20 text-center relative z-10 w-full">
          <div className="inline-block mb-6 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase" style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa'}}>
            ✦ Premium Online Supermarket
          </div>
          <h1 className="text-4xl sm:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">Shop The</span>
            <br />
            <span style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365, #fda085)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Finest Products
            </span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            From fresh groceries to luxury perfumes, electronics to fashion — everything delivered to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-10 py-4 rounded-full font-bold text-lg text-white transition-all hover:scale-105"
              style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.5)'}}
            >
              Shop Now →
            </Link>
            <Link
              href="/products?category=perfumes-fragrances"
              className="px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
              style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white'}}
            >
              View Perfumes 🌸
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-16">
            {[
              {value: '500+', label: 'Products'},
              {value: '10+', label: 'Categories'},
              {value: '24/7', label: 'Support'},
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  {stat.value}
                </p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-purple-400 text-sm font-bold tracking-widest uppercase mb-2">Browse</p>
          <h2 className="text-3xl font-black text-white">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="card p-5 text-center cursor-pointer group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {categoryIcons[cat.slug] || '📦'}
              </div>
              <p className="text-sm font-semibold text-gray-300 group-hover:text-purple-300 transition-colors">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-6xl mx-auto px-4 py-6 pb-20">
        <div className="text-center mb-10">
          <p className="text-purple-400 text-sm font-bold tracking-widest uppercase mb-2">Handpicked</p>
          <h2 className="text-3xl font-black text-white">Featured Products</h2>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-lg text-gray-400">No featured products yet.</p>
            <Link
              href="/admin"
              className="mt-6 inline-block px-8 py-3 rounded-full font-bold text-white"
              style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)'}}
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card p-4 group">
                <div className="relative rounded-xl overflow-hidden mb-4" style={{background: 'rgba(124,58,237,0.1)', height: '180px'}}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">📦</span>
                    </div>
                  )}
                  {product.compare_price && (
                    <div className="absolute top-2 left-2 badge">SALE</div>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-gray-200 mb-2 line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="price-tag text-base">
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
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)'}}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner */}
      <div className="mx-4 mb-16 rounded-3xl overflow-hidden" style={{background: 'linear-gradient(135deg, #1a0533, #2d1b69)', border: '1px solid rgba(124,58,237,0.3)'}}>
        <div className="max-w-6xl mx-auto px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-purple-300 text-sm font-bold tracking-widest uppercase mb-2">Free Delivery</p>
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-2">Order Anything,</h3>
            <h3 className="text-2xl sm:text-4xl font-black" style={{background: 'linear-gradient(135deg, #f6d365, #fda085)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Delivered to You
            </h3>
          </div>
          <Link
            href="/products"
            className="shrink-0 px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105"
            style={{background: 'linear-gradient(135deg, #f6d365, #fda085)', color: '#1a1a2e'}}
          >
            Start Shopping →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{background: '#0d0d1a', borderTop: '1px solid rgba(124,58,237,0.2)'}} className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              ✦ FRESHMART
            </h2>
            <p className="text-gray-500 text-sm">Your Premium Online Supermarket</p>
          </div>
          <div className="flex justify-center gap-8 text-sm mb-8">
            {[
              {href: '/products', label: 'Products'},
              {href: '/cart', label: 'Cart'},
              {href: '/orders', label: 'Orders'},
              {href: '/admin', label: 'Admin'},
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-gray-500 hover:text-purple-400 transition">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-center text-gray-700 text-xs">
            © 2024 FreshMart. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
              }
