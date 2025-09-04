import { useState, useEffect } from 'react'
import { useCart } from '@/cart/Cartcontext'
import { useAuth } from '@/contexts/AuthContext'
import { Trash2, Minus, Plus, ShoppingCart, Package, Search, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckoutConfirmation } from '@/components/CheckoutConfirmation'

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
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart, processCheckout, fetchUserCart, addMultipleToCart } = useCart()
  const { isAuthenticated, token, user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showCheckoutConfirmation, setShowCheckoutConfirmation] = useState(false)
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false)
  const [checkoutResult, setCheckoutResult] = useState<any>(null)
  const [selectedProducts, setSelectedProducts] = useState<Array<{productId: string, quantity: number, product: Product}>>([])
    
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

  // Only fetch cart when explicitly needed, not automatically

  // Handle product selection with quantity
  const handleProductSelection = (product: Product, quantity: number) => {
    const existingIndex = selectedProducts.findIndex(item => item.productId === product.id)
    
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

  // Handle remove product from selection
  const handleRemoveFromSelection = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(item => item.productId !== productId))
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
      
      // Remove from backend cart
      const response = await fetch(`http://localhost:3000/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
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

  // Handle clear cart and refresh
  const handleClearCartAndRefresh = async () => {
    try {
      // Clear frontend cart immediately
      clearCart()
      
      // Clear backend cart
      const response = await fetch('http://localhost:3000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        console.log('Cart cleared successfully!')
      } else {
        console.error('Failed to clear cart from backend')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
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

    setIsProcessingCheckout(true)
    
    try {
      // Step 1: Create order with cart total amount
      const orderResponse = await fetch('http://localhost:3000/api/orders/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await orderResponse.json()
      const createdOrderId = orderData.data.order.id

      // Step 2: Create Razorpay order
      const razorpayResponse = await fetch('http://localhost:3000/api/orders/razorpay/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: createdOrderId
        })
      })

      if (!razorpayResponse.ok) {
        throw new Error('Failed to create Razorpay order')
      }

      const razorpayData = await razorpayResponse.json()
      
      // Step 3: Initialize Razorpay payment directly
      const options = {
        key: razorpayData.data.key_id,
        amount: razorpayData.data.amount,
        currency: razorpayData.data.currency,
        name: 'IT Partner E-commerce',
        description: `Order for ${checkoutResult?.orderSummary?.totalItems || cart.totalItems} items`,
        order_id: razorpayData.data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Step 4: Verify payment
            const verifyResponse = await fetch('http://localhost:3000/api/orders/razorpay/verify', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            })

            if (verifyResponse.ok) {
              // Payment successful - show success message and reload page
              alert('Payment successful! Your order has been placed.')
              window.location.reload() // Reload the page to refresh cart state
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Add some products to your cart to get started
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowProductSelector(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Package className="h-4 w-4" />
              Add Products
            </button>
          </div>
        </div>

        {/* Product Selector Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-lg w-full max-w-lg max-h-[50vh] overflow-hidden">
              <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Add Products to Cart
                  </h2>
                  <div className="flex items-center gap-2">
                    {selectedProducts.length > 0 && (
                      <button
                        onClick={handleSubmitSelectedProducts}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                      >
                        Add to Cart ({selectedProducts.length})
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowProductSelector(false)
                        setSelectedProducts([]) // Clear selections when closing
                      }}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
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
              
              <div className="p-2 overflow-y-auto max-h-[35vh]">
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
                    {products.map((product) => {
                      const selectedItem = selectedProducts.find(item => item.productId === product.id)
                      const selectedQuantity = selectedItem?.quantity || 0
                      
                      return (
                        <div
                          key={product.id}
                          className={`bg-zinc-50 dark:bg-zinc-700 rounded-lg border-2 p-3 hover:shadow-md transition-shadow ${
                            selectedQuantity > 0 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-600'
                          }`}
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
                            
                            {/* Quantity Selection */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleProductSelection(product, Math.max(0, selectedQuantity - 1))}
                                className="w-8 h-8 bg-zinc-200 dark:bg-zinc-600 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {selectedQuantity}
                              </span>
                              <button
                                onClick={() => handleProductSelection(product, selectedQuantity + 1)}
                                className="w-8 h-8 bg-zinc-200 dark:bg-zinc-600 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            
                            {selectedQuantity > 0 && (
                              <button
                                onClick={() => handleRemoveFromSelection(product.id)}
                                className="w-full bg-red-600 text-white py-1 rounded-lg hover:bg-red-700 transition-colors text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
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
                onClick={handleClearCartAndRefresh}
                className="text-red-600 hover:text-red-700 px-4 py-2 bg-slate-600  rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={fetchUserCart}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Package className="h-4 w-4" />
                Refresh Cart
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
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Qty: {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        alert('Quantity updates will be implemented soon. Please remove and re-add items to change quantities.')
                      }}
                      className="text-blue-600 hover:text-blue-700 px-2 py-1 text-sm"
                    >
                      Update
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => item.productId && handleRemoveFromCart(item.productId)}
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

            <button 
              onClick={handleProceedToCheckout}
              disabled={isProcessingCheckout}
              className="w-full bg-white text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-500 hover:text-white transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessingCheckout ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  <span>Calculating Totals...</span>
                </>
              ) : (
                <span>{isAuthenticated && token ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
              )}
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
                    {products.map((product) => {
                      const selectedItem = selectedProducts.find(item => item.productId === product.id)
                      const selectedQuantity = selectedItem?.quantity || 0
                      
                      return (
                        <div
                          key={product.id}
                          className={`bg-zinc-50 dark:bg-zinc-700 rounded-lg border-2 p-3 hover:shadow-md transition-shadow ${
                            selectedQuantity > 0 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-200 dark:border-zinc-600'
                          }`}
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
                            
                            {/* Quantity Selection */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleProductSelection(product, Math.max(0, selectedQuantity - 1))}
                                className="w-8 h-8 bg-zinc-200 dark:bg-zinc-600 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {selectedQuantity}
                              </span>
                              <button
                                onClick={() => handleProductSelection(product, selectedQuantity + 1)}
                                className="w-8 h-8 bg-zinc-200 dark:bg-zinc-600 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            
                            {selectedQuantity > 0 && (
                              <button
                                onClick={() => handleRemoveFromSelection(product.id)}
                                className="w-full bg-red-600 text-white py-1 rounded-lg hover:bg-red-700 transition-colors text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Selected Products Summary */}
              {selectedProducts.length > 0 && (
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    Selected Products ({selectedProducts.length})
                  </h3>
                  <div className="space-y-2 mb-4">
                    {selectedProducts.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{(item.product.rate * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Total: </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        ₹{selectedProducts.reduce((sum, item) => sum + (item.product.rate * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handleSubmitSelectedProducts}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
      )}

      {/* Checkout Confirmation - Shows backend-calculated totals */}
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
      />
    </div>
  )
}

