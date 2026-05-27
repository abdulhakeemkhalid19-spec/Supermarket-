'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminGuard from '@/components/AdminGuard'

export default function StockPage() {
  const [products, setProducts] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [form, setForm] = useState({
    movement_type: 'in',
    quantity: '',
    reason: '',
  })

  useEffect(() => {
    fetchProducts()
    fetchMovements()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('name')
    if (data) setProducts(data)
    setLoading(false)
  }

  const fetchMovements = async () => {
    const { data } = await supabase
      .from('stock_movements')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setMovements(data)
  }

  const handleStockUpdate = async () => {
    if (!selectedProduct) {
      alert('Please select a product!')
      return
    }
    if (!form.quantity || parseInt(form.quantity) <= 0) {
      alert('Please enter a valid quantity!')
      return
    }
    const quantity = parseInt(form.quantity)
    await supabase.from('stock_movements').insert({
      product_id: selectedProduct.id,
      movement_type: form.movement_type,
      quantity,
      reason: form.reason,
    })
    const newStock = form.movement_type === 'in'
      ? selectedProduct.stock_quantity + quantity
      : Math.max(0, selectedProduct.stock_quantity - quantity)
    await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', selectedProduct.id)
    alert(`Stock ${form.movement_type === 'in' ? 'added' : 'removed'} successfully! ✅`)
    setForm({ movement_type: 'in', quantity: '', reason: '' })
    setSelectedProduct(null)
    fetchProducts()
    fetchMovements()
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

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Inventory</p>
            <h1 className="text-3xl font-black text-white">Stock Management</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-6">

            {/* Stock Update Form */}
            <div className="md:w-80 shrink-0">
              <div className="card p-6 mb-6">
                <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
                  Update Stock
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                      Select Product
                    </label>
                    <select
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const product = products.find((p) => p.id === e.target.value)
                        setSelectedProduct(product || null)
                      }}
                      style={{...inputStyle, background: '#1a1a2e'}}
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} style={{background: '#1a1a2e'}}>
                          {p.name} (Stock: {p.stock_quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                      Movement Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setForm({...form, movement_type: 'in'})}
                        className="flex-1 py-3 rounded-xl font-bold text-sm transition hover:scale-105"
                        style={form.movement_type === 'in'
                          ? {background: 'linear-gradient(135deg, #059669, #034d2e)', color: 'white'}
                          : {background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.1)'}
                        }
                      >
                        ➕ Stock In
                      </button>
                      <button
                        onClick={() => setForm({...form, movement_type: 'out'})}
                        className="flex-1 py-3 rounded-xl font-bold text-sm transition hover:scale-105"
                        style={form.movement_type === 'out'
                          ? {background: 'linear-gradient(135deg, #dc2626, #7f1d1d)', color: 'white'}
                          : {background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.1)'}
                        }
                      >
                        ➖ Stock Out
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setForm({...form, quantity: e.target.value})}
                      placeholder="Enter quantity"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                      Reason (optional)
                    </label>
                    <input
                      type="text"
                      value={form.reason}
                      onChange={(e) => setForm({...form, reason: e.target.value})}
                      placeholder="e.g. New delivery, Damaged"
                      style={inputStyle}
                    />
                  </div>

                  {selectedProduct && (
                    <div className="rounded-xl p-4" style={{background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)'}}>
                      <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                      <p className="font-black text-2xl text-white">
                        {selectedProduct.stock_quantity}
                        <span className="text-sm text-gray-500 ml-1">{selectedProduct.unit}s</span>
                      </p>
                      {form.quantity && (
                        <>
                          <p className="text-xs text-gray-500 mt-2 mb-1">After Update</p>
                          <p className={`font-black text-2xl ${
                            form.movement_type === 'in' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {form.movement_type === 'in'
                              ? selectedProduct.stock_quantity + parseInt(form.quantity || '0')
                              : Math.max(0, selectedProduct.stock_quantity - parseInt(form.quantity || '0'))
                            }
                            <span className="text-sm text-gray-500 ml-1">{selectedProduct.unit}s</span>
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleStockUpdate}
                    className="w-full py-4 rounded-xl font-black text-white transition hover:scale-105"
                    style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
                  >
                    ✅ Update Stock
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Levels & Movements */}
            <div className="flex-1">

              {/* Stock Levels */}
              <div className="card p-6 mb-6">
                <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
                  Current Stock Levels
                </p>
                {loading ? (
                  <p className="text-center text-gray-600 py-8">Loading...</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'}}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{background: 'rgba(124,58,237,0.15)'}}>
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-sm">📦</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-200 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.categories?.name}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-black text-lg ${
                            product.stock_quantity === 0
                              ? 'text-red-400'
                              : product.stock_quantity < 5
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}>
                            {product.stock_quantity}
                          </p>
                          <p className="text-xs text-gray-600">{product.unit}s</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Movements */}
              <div className="card p-6">
                <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
                  Recent Stock Movements
                </p>
                {movements.length === 0 ? (
                  <p className="text-center text-gray-600 py-4">No stock movements yet.</p>
                ) : (
                  <div className="space-y-2">
                    {movements.map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{borderBottom: '1px solid rgba(255,255,255,0.03)'}}
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-200">
                            {movement.products?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {movement.reason || 'No reason'} •{' '}
                            {new Date(movement.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`font-black text-xl ${
                          movement.movement_type === 'in' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
