import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/cart/Cartcontext'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, Shield, Truck, CheckCircle, Loader2 } from 'lucide-react'

export function Payment() {
  const { user, isAuthenticated, token } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get total amount from navigation state (from notification) or use cart total
  const notificationTotal = location.state?.totalAmount
  const displayTotal = notificationTotal || cart.totalAmount
  const displayItems = location.state?.totalItems || cart.totalItems
  const orderSummary = location.state?.orderSummary
  
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/payment' } } })
    }
  }, [isAuthenticated, navigate])

  // Redirect if cart is empty (unless we have notification total)
  useEffect(() => {
    if (cart.items.length === 0 && !notificationTotal) {
      navigate('/cart')
    }
  }, [cart.items.length, navigate, notificationTotal])

  const handlePayment = async () => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/payment' } } })
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Create order with cart total amount
      const orderResponse = await fetch('http://localhost:5000/api/orders/create', {
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
      setOrderId(createdOrderId)

      // Step 2: Create Razorpay order
      const razorpayResponse = await fetch('http://localhost:5000/api/orders/razorpay/create', {
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
      
      // Step 3: Initialize Razorpay payment
      const options = {
        key: razorpayData.data.key_id,
        amount: razorpayData.data.amount,
        currency: razorpayData.data.currency,
        name: 'IT Partner E-commerce',
        description: `Order for ${displayItems} items`,
        order_id: razorpayData.data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Step 4: Verify payment
            const verifyResponse = await fetch('http://localhost:5000/api/orders/razorpay/verify', {
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
              const verifyData = await verifyResponse.json()
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

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (cart.items.length === 0 && !notificationTotal) {
    return null // Will redirect to cart
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
            <p className="text-blue-100">Complete your purchase</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Order Summary */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(item.rate * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal ({displayItems} items)</span>
                  <span>₹{displayTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹{displayTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
              
              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                <p className="text-sm text-gray-600">
                  {user?.fullName}<br />
                  {user?.houseNumber}, {user?.street}<br />
                  {user?.area}, {user?.city}<br />
                  {user?.state} - {user?.pinCode}<br />
                  Phone: {user?.phone}
                </p>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span>Razorpay (Credit/Debit Cards, UPI, Net Banking)</span>
                  </label>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Secure Payment</h3>
                <p className="text-sm text-blue-700">
                  Your payment will be processed securely through Razorpay. 
                  You can pay using credit cards, debit cards, UPI, or net banking.
                </p>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Pay ₹{displayTotal.toFixed(2)}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Click "Pay" to proceed to secure Razorpay payment gateway.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

