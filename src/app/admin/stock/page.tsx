'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

    // Record stock movement
    await supabase.from('stock_movements').insert({
      product_id: selectedProduct.id,
      movement_type: form.movement_type,
      quantity,
      reason: form.reason,
    })

    // Update product stock
    const newStock =
      form.movement_type === 'in'
        ? selectedProduct.stock_quantity + quantity
        : Math.max(0, selectedProduct.stock_quantity - quantity)

    await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', selectedProduct.id)

    alert(
      `Stock ${form.movement_type === 'in' ? 'added' : 'removed'} successfully! ✅`
    )

    setForm({ movement_type: 'in', quantity: '', reason: '' })
    setSelectedProduct(null)
    fetchProducts()
    fetchMovements()
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-purple-800 mb-6">
          📦 Stock Management
        </h1>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Stock Update Form */}
          <div className="md:w-80 shrink-0">
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-bold text-purple-800 mb-4">
                Update Stock
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">
                    Select Product
                  </label>
                  <select
                    value={selectedProduct?.id || ''}
                    onChange={(e) => {
                      const product = products.find(
                        (p) => p.id === e.target.value
                      )
                      setSelectedProduct(product || null)
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock_quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">
                    Movement Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setForm({ ...form, movement_type: 'in' })
                      }
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                        form.movement_type === 'in'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      ➕ Stock In
                    </button>
                    <button
                      onClick={() =>
                        setForm({ ...form, movement_type: 'out' })
                      }
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                        form.movement_type === 'out'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      ➖ Stock Out
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    placeholder="Enter quantity"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    placeholder="e.g. New delivery, Damaged goods"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500"
                  />
                </div>

                {selectedProduct && (
                  <div className="bg-purple-50 rounded-lg p-3 text-sm">
                    <p className="text-gray-500">Current Stock</p>
                    <p className="font-bold text-purple-800 text-lg">
                      {selectedProduct.stock_quantity} {selectedProduct.unit}s
                    </p>
                    {form.quantity && (
                      <>
                        <p className="text-gray-500 mt-1">After Update</p>
                        <p className={`font-bold text-lg ${
                          form.movement_type === 'in'
                            ? 'text-green-600'
                            : 'text-red-500'
                        }`}>
                          {form.movement_type === 'in'
                            ? selectedProduct.stock_quantity + parseInt(form.quantity || '0')
                            : Math.max(0, selectedProduct.stock_quantity - parseInt(form.quantity || '0'))
                          } {selectedProduct.unit}s
                        </p>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={handleStockUpdate}
                  className="w-full bg-purple-700 text-white py-3 rounded-lg font-bold hover:bg-purple-800 transition"
                >
                  ✅ Update Stock
                </button>
              </div>
            </div>
          </div>

          {/* Products Stock List */}
          <div className="flex-1">
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-bold text-purple-800 mb-4">
                📊 Current Stock Levels
              </h2>
              {loading ? (
                <p className="text-center text-gray-400 py-8">Loading...</p>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.categories?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          product.stock_quantity === 0
                            ? 'text-red-500'
                            : product.stock_quantity < 5
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {product.stock_quantity}
                        </p>
                        <p className="text-xs text-gray-400">{product.unit}s</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Stock Movements */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-purple-800 mb-4">
                🕐 Recent Stock Movements
              </h2>
              {movements.length === 0 ? (
                <p className="text-center text-gray-400 py-4">
                  No stock movements yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-3 border-b text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {movement.products?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {movement.reason || 'No reason given'} •{' '}
                          {new Date(movement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-bold text-lg ${
                        movement.movement_type === 'in'
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}>
                        {movement.movement_type === 'in' ? '+' : '-'}
                        {movement.quantity}
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
      <footer className="bg-purple-900 text-purple-200 mt-16 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-2xl font-bold text-white mb-2">🛒 FreshMart</p>
          <p className="text-sm">© 2024 FreshMart. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
