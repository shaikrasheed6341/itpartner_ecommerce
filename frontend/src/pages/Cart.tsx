import { useState, useEffect } from 'react'
import { useCart } from '@/cart/Cartcontext'
import { useAuth } from '@/contexts/AuthContext'
import { Trash2, Minus, Plus, ShoppingCart, Package, Search, X, RefreshCw, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CheckoutConfirmation } from '@/components/CheckoutConfirmation'
import { productsApi, ordersApi, apiClient, cartApi } from '@/lib/api'

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

export function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, processCheckout, fetchUserCart, addMultipleToCart } = useCart()
  const { isAuthenticated, token, user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showCheckoutConfirmation, setShowCheckoutConfirmation] = useState(false)
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false)
  const [checkoutResult, setCheckoutResult] = useState<any>(null)
  const [selectedProducts, setSelectedProducts] = useState<Array<{ productId: string, quantity: number, product: Product }>>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch products for selection
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getAll({ search: searchTerm })

      if (response?.success && Array.isArray(response.data?.products)) {
        setProducts(response.data.products)
      } else if (Array.isArray(response?.data)) {
        setProducts(response.data)
      } else {
        console.error('Failed to fetch products:', response?.error)
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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

  // Fetch cart on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCart()
    }
  }, [isAuthenticated, fetchUserCart])

  // Handle product selection with quantity
  const handleProductSelection = (product: Product, quantity: number) => {
    const existingIndex = selectedProducts.findIndex(item => item.productId === product.id)

    if (quantity <= 0) {
      if (existingIndex >= 0) {
        // Remove from selection
        const updated = selectedProducts.filter(item => item.productId !== product.id)
        setSelectedProducts(updated)
      }
      return
    }

    if (existingIndex >= 0) {
      // Update existing selection
      const updated = [...selectedProducts]
      updated[existingIndex].quantity = quantity
      setSelectedProducts(updated)
    } else {
      // Add new selection
      setSelectedProducts([...selectedProducts, { productId: product.id, quantity, product }])
    }
  }

  // Handle submit selected products to cart
  const handleSubmitSelectedProducts = async () => {
    if (selectedProducts.length === 0) {
      console.log('Please select at least one product')
      return
    }

    try {
      // Prepare items for backend
      const items = selectedProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      // Send to backend
      const result = await addMultipleToCart(items)

      if (result.success) {
        // Clear selection and close modal
        setSelectedProducts([])
        setShowProductSelector(false)

        // Refresh cart from backend
        await fetchUserCart()

        // Show success message
        console.log(`Successfully added ${selectedProducts.length} product(s) to cart!`)
      } else {
        console.error(result.message || 'Failed to add products to cart')
      }
    } catch (error) {
      console.error('Error adding products to cart:', error)
    }
  }

  // Handle remove item from cart
  const handleRemoveFromCart = async (productId: string) => {
    try {
      // Remove from frontend cart immediately
      removeFromCart(productId)

      if (token) apiClient.setAuthToken(token)
      else apiClient.removeAuthToken()

      // Remove from backend cart
      const response = await cartApi.remove(productId)

      if (response?.success) {
        console.log('Item removed from cart successfully!')
      } else {
        console.error('Failed to remove item from backend cart')
        // If backend fails, refresh cart to sync state
        await fetchUserCart()
      }
    } catch (error) {
      console.error('Error removing item from cart:', error)
      // If error occurs, refresh cart to sync state
      await fetchUserCart()
    }
  }

  // Handle update cart item quantity
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(itemId, newQuantity)
    // Note: The context's updateQuantity usually handles generic state updates.
    // Ideally we should also sync with backend if needed, but the current context 
    // implementation might handle it or we might need to enhance it. 
    // For now we rely on the context function provided.

    // If you need to persist strictly to backend immediately:
    // This depends on how specific the CartContext implementation is.
  }

  // Handle clear cart and refresh
  const handleClearCartAndRefresh = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      // Clear frontend cart immediately
      clearCart()

      if (token) apiClient.setAuthToken(token)
      else apiClient.removeAuthToken()

      const response = await cartApi.clear()

      if (response?.success) {
        console.log('Cart cleared successfully!')
      } else {
        console.error('Failed to clear cart from backend')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const handleRefreshCart = async () => {
    setIsRefreshing(true)
    await fetchUserCart()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Handle proceed to checkout with authentication check
  const handleProceedToCheckout = async () => {
    if (!isAuthenticated || !token) {
      // Redirect to login page with return path
      navigate('/login', { state: { from: { pathname: '/payment' } } })
      return
    }

    // First, fetch the latest cart from backend
    await fetchUserCart()

    // Check if cart has items
    if (cart.items.length === 0) {
      console.log('Your cart is empty. Please add items before proceeding to checkout.')
      return
    }

    // Send POST request to backend to calculate totals
    setIsProcessingCheckout(true)

    try {
      // Send frontend cart data to backend for calculation
      const result = await processCheckout()

      console.log('Backend checkout result:', result) // Debug log

      if (result.success && result.data?.orderSummary) {
        // Store backend-calculated totals
        setCheckoutResult(result.data)
        // Show confirmation dialog with backend totals
        setShowCheckoutConfirmation(true)
      } else {
        console.error(result.message || 'Failed to calculate cart totals')
      }
    } catch (error) {
      console.error('Error calculating cart totals:', error)
    } finally {
      setIsProcessingCheckout(false)
    }
  }

  // Handle checkout confirmation - directly open Razorpay
  const handleConfirmCheckout = async () => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/payment' } } })
      return
    }

    if (!checkoutResult?.orderSummary?.orderId) {
      console.error('No order found in checkout result')
      return
    }

    setIsProcessingCheckout(true)

    try {
      // Use the order ID from the checkout result (order was already created by processCheckout)
      const createdOrderId = checkoutResult.orderSummary.orderId

      // Create Razorpay order (order already created by processCheckout)
      if (token) apiClient.setAuthToken(token)
      else apiClient.removeAuthToken()

      const razorpayResponse = await ordersApi.createRazorpayOrder({ orderId: createdOrderId })

      if (!razorpayResponse?.success) {
        throw new Error('Failed to create Razorpay order')
      }

      const razorpayData = razorpayResponse

      // Initialize Razorpay payment directly
      const options = {
        key: razorpayData.data.key_id,
        amount: razorpayData.data.amount,
        currency: razorpayData.data.currency,
        name: 'IT Partner E-commerce',
        description: `Order for ${checkoutResult?.orderSummary?.totalItems || cart.totalItems} items`,
        order_id: razorpayData.data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await ordersApi.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            if (verifyResponse?.success) {
              const verifyData = verifyResponse
              // Payment successful - redirect to success page with order data
              navigate('/payment-success', {
                state: {
                  orderData: verifyData.data,
                  paymentData: verifyData.data.payment
                }
              })
            } else {
              alert('Payment verification failed. Please contact support.')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#3B82F6'
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

      // Close the confirmation dialog
      setShowCheckoutConfirmation(false)

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessingCheckout(false)
    }
  }

  // Handle close checkout confirmation
  const handleCloseCheckoutConfirmation = () => {
    setShowCheckoutConfirmation(false)
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-7xl min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-zinc-50 rounded-full p-6 mb-6">
          <ShoppingCart className="h-12 w-12 text-zinc-300" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-zinc-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet.
          Explore our products and find something you love.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Package className="h-4 w-4" />
          Start Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items - Left Side */}
        <div className="flex-1 lg:w-2/3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 font-display">
                Shopping Cart
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                You have {cart.items.reduce((acc, item) => acc + item.quantity, 0)} items in your cart
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 px-4 py-2 text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Items
              </button>

              <button
                onClick={handleRefreshCart}
                disabled={isRefreshing}
                className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors rounded-lg border border-transparent hover:border-zinc-200 hover:bg-white"
                title="Refresh Cart"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleClearCartAndRefresh}
                className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg border border-transparent hover:border-red-100 hover:bg-red-50"
                title="Clear Cart"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-zinc-100 bg-zinc-50/50 px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-zinc-100">
              {cart.items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-50/30 transition-colors group">
                  {/* Product Column */}
                  <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                    <div className="h-16 w-16 bg-zinc-100 rounded-lg border border-zinc-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover mix-blend-multiply"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-zinc-900 truncate pr-4 text-sm sm:text-base">
                        {item.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.brand}
                      </p>

                      {/* Mobile Price View */}
                      <div className="sm:hidden mt-2 font-medium text-zinc-900">
                        ₹{Number(item.rate).toFixed(2)}
                      </div>

                      <button
                        onClick={() => item.productId && handleRemoveFromCart(item.productId)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium mt-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className="hidden sm:block col-span-2 text-center text-sm font-medium text-zinc-600">
                    ₹{Number(item.rate).toFixed(2)}
                  </div>

                  {/* Quantity Column */}
                  <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center mt-2 sm:mt-0">
                    <div className="inline-flex items-center bg-zinc-100 rounded-lg border border-zinc-200 p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-zinc-900">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Total Column */}
                  <div className="col-span-1 sm:col-span-2 text-left sm:text-right font-bold text-zinc-900 mt-2 sm:mt-0 border-t sm:border-0 pt-2 sm:pt-0 border-dashed border-zinc-200">
                    <span className="sm:hidden text-zinc-500 text-xs font-normal mr-2">Total:</span>
                    ₹{(Number(item.rate) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center text-sm text-zinc-500 italic">
            <p>Prices are inclusive of all applicable taxes</p>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </button>
          </div>
        </div>

        {/* Order Summary - Right Side */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Subtotal ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span className="font-medium text-zinc-900">
                  ₹{Number(cart.totalAmount).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-zinc-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full">Free</span>
              </div>

              <div className="flex justify-between text-sm text-zinc-600">
                <span>Taxes</span>
                <span className="text-zinc-400 font-normal">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-dashed border-zinc-200 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-zinc-900">Total Amount</span>
                <span className="text-2xl font-bold text-zinc-900 tracking-tight">
                  ₹{Number(cart.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={isProcessingCheckout}
              className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isProcessingCheckout ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Checkout Now</span>
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><Package className="h-3 w-3" /> Free Shipping</span>
              <span className="w-px h-3 bg-zinc-200"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Add More Items
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Select products to add to your cart</p>
              </div>
              <button
                onClick={() => setShowProductSelector(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 shrink-0 bg-zinc-50/50 border-b border-zinc-100">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-zinc-50/30">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-200 border-t-zinc-800"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900 mb-1">
                    No products found
                  </h3>
                  <p className="text-zinc-500 text-sm">
                    {searchTerm ? `No matches for "${searchTerm}"` : 'No products available.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const selectedItem = selectedProducts.find(item => item.productId === product.id)
                    const selectedQuantity = selectedItem?.quantity || 0

                    return (
                      <div
                        key={product.id}
                        className={`group bg-white dark:bg-zinc-800 rounded-xl border p-3 transition-all hover:-translate-y-1 hover:shadow-lg ${selectedQuantity > 0
                          ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-500'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                          }`}
                      >
                        <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-700 rounded-lg overflow-hidden mb-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          {selectedQuantity > 0 && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                              {selectedQuantity} in selection
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col h-24">
                          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm line-clamp-2 mb-1" title={product.name}>
                            {product.name}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-auto">
                            {product.brand}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="text-sm font-bold text-zinc-900 dark:text-white">
                              ₹{Number(product.rate).toFixed(2)}
                            </div>

                            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductSelection(product, Math.max(0, selectedQuantity - 1));
                                }}
                                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${selectedQuantity === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-zinc-600 shadow-sm'}`}
                                disabled={selectedQuantity === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">
                                {selectedQuantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductSelection(product, selectedQuantity + 1);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-600 shadow-sm transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Selected Products Footer */}
            {selectedProducts.length > 0 && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 z-10">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="text-sm">
                    <span className="text-zinc-500">Selected Total: </span>
                    <span className="font-bold text-xl text-zinc-900 dark:text-white ml-2">
                      ₹{selectedProducts.reduce((sum, item) => sum + (Number(item.product.rate) * item.quantity), 0).toFixed(2)}
                    </span>
                    <span className="text-zinc-400 mx-2">|</span>
                    <span className="text-zinc-500">{selectedProducts.length} items</span>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedProducts([]);
                        setShowProductSelector(false);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitSelectedProducts}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 font-medium transition-all shadow-lg hover:shadow-xl shadow-zinc-200"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <CheckoutConfirmation
        isOpen={showCheckoutConfirmation}
        onClose={handleCloseCheckoutConfirmation}
        onConfirm={handleConfirmCheckout}
        summary={{
          totalAmount: checkoutResult?.orderSummary?.totalAmount || 0,
          totalItems: checkoutResult?.orderSummary?.totalItems || 0,
          itemCount: checkoutResult?.orderSummary?.items?.length || 0
        }}
        isLoading={isProcessingCheckout}
        shippingAddress={user ? {
          fullName: user.fullName || user.name || '',
          houseNumber: user.houseNumber || '',
          street: user.street || '',
          area: user.area || '',
          city: user.city || '',
          state: user.state || '',
          pinCode: user.pinCode || '',
          phone: user.phone || ''
        } : null}
        items={cart.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          image_url: item.image_url
        }))}
      />
    </div>
  )
}
