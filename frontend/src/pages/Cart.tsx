import { useState, useEffect } from 'react'
import { useCart } from '@/cart/Cartcontext'
import { Trash2, Minus, Plus, ShoppingCart, Package, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Product {
  id: string
  name: string
  brand: string
  image_url?: string
  quantity?: number
  rate: number
  createdAt: string
  updatedAt: string
}
interface shipping{
  shipping: number
}

export function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSelector, setShowProductSelector] = useState(false)
    
  // Fetch products for selection
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/products?search=${searchTerm}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data.products)
      } else {
        console.error('Failed to fetch products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showProductSelector) {
      fetchProducts()
    }
  }, [searchTerm, showProductSelector])

  // Handle add product to cart
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image_url: product.image_url,
      rate: product.rate
    })
    
    alert(`${product.name} added to cart!`)
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Add some products to your cart to get started
          </p>
          <button
            onClick={() => setShowProductSelector(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Package className="h-4 w-4" />
            Add Products
          </button>
        </div>

        {/* Product Selector Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Add Products to Cart
                  </h2>
                  <button
                    onClick={() => setShowProductSelector(false)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search products by name or brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      No products found
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {searchTerm ? 'Try adjusting your search terms.' : 'No products available.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-zinc-50 dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 p-3 hover:shadow-md transition-shadow"
                      >
                        {product.image_url && (
                          <div className="aspect-square bg-zinc-100 dark:bg-zinc-600 rounded-lg overflow-hidden mb-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                            {product.name}
                          </h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {product.brand}
                          </p>
                          <div className="text-sm font-bold text-slate-600">
                            ₹{product.rate.toFixed(2)}
                          </div>
                          
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Add to Cart 
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Shopping Cart
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProductSelector(true)}
                className="inline-flex items-center gap-2 px-4  text-sm  py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add More Products
              </button>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 px-4 py-2 bg-slate-600  rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  {item.image_url && (
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      {item.brand}
                    </p>
                    <div className="text-lg font-bold text-white">
                      ₹{item.rate.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-zinc-900 dark:text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Quantity: {item.quantity}
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Total: ₹{(item.rate * item.quantity).toFixed(2)}
                    </span>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Items ({cart.totalItems})</span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  ₹{cart.totalAmount.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Shipping</span>
                <span className="text-zinc-900 dark:text-zinc-100">Free</span>
              </div>
              
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-zinc-900 dark:text-zinc-100">Total</span>
                  <span className="text-white">₹{cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-white text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-500 hover:text-white transition-colors mb-3">
              Proceed to Checkout
            </button>
            
        
          </div>
        </div>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Add More Products to Cart
                </h2>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search products by name or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    No products found
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No products available.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-zinc-50 dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 p-3 hover:shadow-md transition-shadow"
                    >
                      {product.image_url && (
                        <div className="aspect-square bg-zinc-100 dark:bg-zinc-600 rounded-lg overflow-hidden mb-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                          {product.name}
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {product.brand}
                        </p>
                        <div className="text-sm font-bold text-blue-600">
                          ₹{product.rate.toFixed(2)}
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
