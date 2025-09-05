import { useState, useEffect } from 'react'
import { Plus, Search, Package, ShoppingCart, Minus, X } from 'lucide-react'
import { useCart } from '@/cart/Cartcontext'
import { useNavigate } from 'react-router-dom'

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

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCartSidebar, setShowCartSidebar] = useState(false)
  const { addToCart, cart, removeFromCart, updateQuantity } = useCart()
  const navigate = useNavigate()

  // Handle add to cart with automatic navigation
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image_url: product.image_url,
      rate: product.rate
    })
    
    // Show success message and navigate to cart
    alert(`${product.name} added to cart!`)
    navigate('/cart')
  }

  // Fetch products
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
    fetchProducts()
  }, [searchTerm])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Products
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Browse and purchase electronic products
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowCartSidebar(true)}
            className="relative inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 hover:text-white transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart ({cart.totalItems})
            {cart.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
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

      {/* Products Grid */}
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
            {searchTerm ? 'Try adjusting your search terms.' : 'Add your first product to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {product.image_url && (
                <div className="aspect-square bg-zinc-100 dark:bg-zinc-700">
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
              
              <div className="p-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  {product.brand}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-white">
                    ₹{product.rate.toFixed(2)}
                  </span>
                </div>
                
                <div className="p-2">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                  >
                    Add & View Cart
                  </button>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Shopping Cart Sidebar */}
      {showCartSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-zinc-800 h-full overflow-y-auto">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Shopping Cart ({cart.totalItems})
                </h2>
                <button
                  onClick={() => setShowCartSidebar(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    Your cart is empty
                  </p>
                  <button
                    onClick={() => setShowCartSidebar(false)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-600 rounded-lg overflow-hidden flex-shrink-0">
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
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {item.brand}
                          </p>
                          <p className="text-sm font-bold text-white">
                            ₹{item.rate.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-600">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            Total: ₹{(item.rate * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        Total Amount:
                      </span>
                      <span className="font-bold text-lg text-white">
                        ₹{cart.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setShowCartSidebar(false)
                          navigate('/cart')
                        }}
                        className="w-full bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                      >
                        View Full Cart
                      </button> 
                      <button
                        onClick={() => setShowCartSidebar(false)}
                        className="w-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}


