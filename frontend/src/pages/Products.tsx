import { useState, useEffect } from 'react'
import { Plus, Search, Package, ShoppingCart, Minus, X, Check, Trash2 } from 'lucide-react'
import { useCart } from '@/cart/Cartcontext'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '@/lib/api'

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

const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: (product: Product, quantity: number) => void }) => {
  const { cart, removeFromCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  // Check if product is in cart
  const cartItem = cart.items.find((item: any) => item.productId === product.id)

  // Sync local quantity with cart quantity if item exists
  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity)
    } else {
      // If item is removed from cart, reset local quantity to 1
      setQuantity(1);
    }
  }, [cartItem])

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleRemove = () => {
    if (cartItem) {
      removeFromCart(cartItem.id)
    }
  }

  return (
    <div
      className="bg-white rounded-lg border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {product.image_url && (
        <div className="aspect-square bg-zinc-100">
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
        <h3 className="font-semibold text-zinc-900 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-zinc-600 mb-2">
          {product.brand}
        </p>

        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-bold text-zinc-900">
            ₹{Number(product.rate).toFixed(2)}
          </span>
        </div>

        {/* Quantity Selector - Always Visible */}
        <div className="flex items-center justify-between mb-3 bg-zinc-50 rounded-lg p-1 border border-zinc-200">
          <span className="text-xs font-medium text-zinc-500 pl-2">Quantity:</span>
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-1.5 hover:bg-zinc-200 rounded-md transition-colors text-zinc-600 disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-zinc-900">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-1.5 hover:bg-zinc-200 rounded-md transition-colors text-zinc-600"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="">
          {cartItem ? (
            <button
              onClick={handleRemove}
              className="w-full bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove from Cart
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product, quantity)}
              className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white py-2.5 rounded-lg  text-sm font-semibold flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-emerald-700 transition-all shadow-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

const ContinueShoppingModal = ({ isOpen, onClose, onGoToCart }: { isOpen: boolean, onClose: () => void, onGoToCart: () => void }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform scale-100 animate-in zoom-in-95 duration-200 border border-white/20">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>

          <h3 className="text-xl font-bold text-zinc-900 mb-2">
            Added to Cart Successfully!
          </h3>
          <p className="text-zinc-500 mb-8 max-w-[80%]">
            The item has been added to your cart. What would you like to do next?
          </p>

          <div className="flex gap-3 w-full flex-row">
            <button
              onClick={onClose}
              className="flex-1 bg-white border border-zinc-200 text-zinc-700 py-3 rounded-xl font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-all focus:ring-4 focus:ring-zinc-100"
            >
              Continue Shopping
            </button>

            <button
              onClick={onGoToCart}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/20 focus:ring-4 focus:ring-emerald-100 flex items-center justify-center gap-2"
            >
              View Cart
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCartSidebar, setShowCartSidebar] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const { addToCart, cart, removeFromCart, updateQuantity } = useCart()
  const navigate = useNavigate()

  // Handle add to cart with modal
  const handleAddToCart = async (product: Product, quantity: number) => {
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        image_url: product.image_url,
        rate: product.rate,
        quantity: quantity // Pass the selected quantity
      })

      // Show modal instead of navigating
      setShowModal(true)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    }
  }

  const handleContinueShopping = () => {
    setShowModal(false)
  }

  const handleGoToCart = () => {
    setShowModal(false)
    navigate('/cart')
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching products from API with search:', searchTerm)

      const response = await productsApi.getAll({ search: searchTerm })
      console.log('Products API response:', response)

      if (response?.success && response.data && response.data.products) {
        console.log('Products found:', response.data.products.length)
        setProducts(response.data.products)
      } else if (Array.isArray(response?.data)) {
        setProducts(response.data)
      } else {
        const errorMsg = response?.error || 'No products data received'
        console.error('Failed to fetch products:', errorMsg)
        setError(errorMsg)
        setProducts([])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect to server'
      console.error('Error fetching products:', errorMsg)
      setError(errorMsg)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchTerm])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Products
          </h1>
          <p className="text-zinc-600">
            Browse and purchase electronic products
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowCartSidebar(true)}
            className="relative inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 hover:text-white transition-colors whitespace-nowrap"
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading products
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-1">
                  <button
                    onClick={fetchProducts}
                    className="font-medium underline hover:text-red-600"
                  >
                    Try again
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 && !error ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            No products found
          </h3>
          <p className="text-zinc-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'Add your first product to get started.'}
          </p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : null}

      {/* Continue Shopping Modal */}
      <ContinueShoppingModal
        isOpen={showModal}
        onClose={handleContinueShopping}
        onGoToCart={handleGoToCart}
      />

      {/* Shopping Cart Sidebar */}
      {showCartSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto">
            <div className="p-4 border-b border-zinc-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-900">
                  Shopping Cart ({cart.totalItems})
                </h2>
                <button
                  onClick={() => setShowCartSidebar(false)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-600 mb-4">
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
                      className="bg-zinc-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <div className="w-12 h-12 bg-zinc-200 rounded-lg overflow-hidden flex-shrink-0">
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
                          <h4 className="font-medium text-zinc-900 text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-zinc-600">
                            {item.brand}
                          </p>
                          <p className="text-sm font-bold text-zinc-900">
                            ₹{Number(item.rate).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-zinc-200 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-zinc-200 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-zinc-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-semibold text-zinc-900">
                            Total: ₹{(Number(item.rate) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-zinc-200 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-zinc-900">
                        Total Amount:
                      </span>
                      <span className="font-bold text-lg text-zinc-900">
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
                        className="w-full bg-zinc-200 text-zinc-700 py-2 rounded-lg hover:bg-zinc-300 transition-colors"
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


