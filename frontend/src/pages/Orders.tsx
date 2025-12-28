import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck, XCircle, Eye, Calendar, CreditCard, User, MapPin, Phone, Mail, ShoppingBag, ArrowRight, ChevronDown, ChevronUp, Star, Shield, Zap } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  itemTotal: number
  product: {
    id: string
    name: string
    brand: string
    image_url: string
    rate: number
  }
}

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  currency: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
  payments: Array<{
    id: string
    amount: number
    status: string
    paymentMethod: string
    createdAt: string
  }>
  summary: {
    totalItems: number
    itemCount: number
  }
}

export function Orders() {
  const { user, isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/orders' } } })
    }
  }, [isAuthenticated, navigate])

  // Fetch user orders
  useEffect(() => {
    if (token && isAuthenticated) {
      fetchUserOrders()
    }
  }, [token, isAuthenticated])

  const fetchUserOrders = async () => {
    try {
      setLoading(true)
      if (token) apiClient.setAuthToken(token)
      else apiClient.removeAuthToken()

      const response = await apiClient.get('/api/v1/orders/')

      if (response?.success) {
        setOrders(response.data.orders)
      } else if (Array.isArray(response?.data)) {
        setOrders(response.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-amber-500" />
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'DELIVERED':
        return <Package className="h-5 w-5 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Processing'
      case 'CONFIRMED':
        return 'Confirmed'
      case 'SHIPPED':
        return 'Shipped'
      case 'DELIVERED':
        return 'Delivered'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchUserOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  My Orders
                </h1>
                <p className="text-slate-600 mt-1">Track your purchases and order history</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{orders.length}</div>
                <div className="text-sm text-slate-500">Total Orders</div>
              </div>
              <div className="h-12 w-px bg-slate-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </div>
                <div className="text-sm text-slate-500">Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-1 text-sm text-slate-500">
                          <Package className="h-4 w-4" />
                          <span>{order.summary.totalItems} items</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        {expandedOrder === order.id ?
                          <ChevronUp className="h-5 w-5" /> :
                          <ChevronDown className="h-5 w-5" />
                        }
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        {order.orderItems.slice(0, 4).map((item, index) => (
                          <div key={item.id} className="relative">
                            <img
                              src={item.product.image_url || '/placeholder-product.jpg'}
                              alt={item.product.name}
                              className="w-12 h-12 rounded-xl border-2 border-white object-cover shadow-sm"
                            />
                            {index === 3 && order.orderItems.length > 4 && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  +{order.orderItems.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">
                          {order.orderItems.length} product{order.orderItems.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {order.orderItems[0]?.product.name}
                          {order.orderItems.length > 1 && ` and ${order.orderItems.length - 1} more`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-slate-500">
                        <CreditCard className="h-4 w-4" />
                        <span>{order.paymentMethod || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-2 mb-4">
                            <Package className="h-5 w-5 text-slate-600" />
                            <h4 className="text-lg font-semibold text-slate-900">Order Items</h4>
                          </div>
                          <div className="space-y-3">
                            {order.orderItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-4 p-4 bg-white/80 rounded-xl border border-slate-200/60"
                              >
                                <img
                                  src={item.product.image_url || '/placeholder-product.jpg'}
                                  alt={item.product.name}
                                  className="w-16 h-16 rounded-xl object-cover shadow-sm"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium text-slate-900">
                                    {item.product.name}
                                  </h5>
                                  <p className="text-sm text-slate-600">
                                    {item.product.brand}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <div className="flex items-center space-x-1 text-sm text-slate-500">
                                      <Package className="h-3 w-3" />
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-slate-500">
                                      <CreditCard className="h-3 w-3" />
                                      <span>₹{item.price.toFixed(2)} each</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-slate-900">
                                    ₹{item.itemTotal.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary & Info */}
                        <div className="space-y-6">
                          {/* Order Summary */}
                          <div>
                            <div className="flex items-center space-x-2 mb-4">
                              <Star className="h-5 w-5 text-slate-600" />
                              <h4 className="text-lg font-semibold text-slate-900">Order Summary</h4>
                            </div>
                            <div className="bg-white/80 rounded-xl p-4 border border-slate-200/60 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal:</span>
                                <span className="text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Shipping:</span>
                                <span className="text-emerald-600 font-medium">Free</span>
                              </div>
                              <div className="border-t border-slate-200 pt-3">
                                <div className="flex justify-between">
                                  <span className="font-semibold text-slate-900">Total:</span>
                                  <span className="font-semibold text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment Information */}
                          <div>
                            <div className="flex items-center space-x-2 mb-4">
                              <Shield className="h-5 w-5 text-slate-600" />
                              <h4 className="text-lg font-semibold text-slate-900">Payment Info</h4>
                            </div>
                            <div className="bg-white/80 rounded-xl p-4 border border-slate-200/60 space-y-3">
                              <div className="flex items-center space-x-3">
                                <CreditCard className="h-4 w-4 text-slate-500" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">Payment Method</p>
                                  <p className="text-sm text-slate-600">{order.paymentMethod || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">Order Date</p>
                                  <p className="text-sm text-slate-600">{formatDate(order.createdAt)}</p>
                                </div>
                              </div>
                              {order.payments.length > 0 && (
                                <div className="flex items-center space-x-3">
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">Payment Status</p>
                                    <p className="text-sm text-emerald-600 font-medium">
                                      {order.payments[0].status}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Order Status Progress */}
                          <div>
                            <div className="flex items-center space-x-2 mb-4">
                              <Zap className="h-5 w-5 text-slate-600" />
                              <h4 className="text-lg font-semibold text-slate-900">Order Progress</h4>
                            </div>
                            <div className="bg-white/80 rounded-xl p-6 border border-slate-200/60">
                              <div className="space-y-4">
                                {/* Simple Status Display */}
                                <div className="flex items-center justify-center space-x-8">
                                  {/* Confirmed */}
                                  <div className="flex flex-col items-center space-y-2">
                                    <div className={`p-3 rounded-full ${['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                      <CheckCircle className={`h-6 w-6 ${['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">Confirmed</span>
                                    {['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                    )}
                                  </div>

                                  {/* Shipped */}
                                  <div className="flex flex-col items-center space-y-2">
                                    <div className={`p-3 rounded-full ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                      <Truck className={`h-6 w-6 ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-blue-600' : 'text-slate-400'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">Shipped</span>
                                    {['SHIPPED', 'DELIVERED'].includes(order.status) && (
                                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>

                                  {/* Delivered */}
                                  <div className="flex flex-col items-center space-y-2">
                                    <div className={`p-3 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100' : 'bg-slate-100'}`}>
                                      <Package className={`h-6 w-6 ${order.status === 'DELIVERED' ? 'text-green-600' : 'text-slate-400'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">Delivered</span>
                                    {order.status === 'DELIVERED' && (
                                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>

                                {/* Status Message */}
                                <div className="text-center mt-6">
                                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                          'bg-slate-100 text-slate-800'
                                    }`}>
                                    {order.status === 'CONFIRMED' && '✅ Order Confirmed - Being prepared for shipment'}
                                    {order.status === 'SHIPPED' && '🚚 Order Shipped - On its way to you'}
                                    {order.status === 'DELIVERED' && '📦 Order Delivered - Thank you for your purchase!'}
                                    {order.status === 'PENDING' && '⏳ Order Pending - Being processed'}
                                    {order.status === 'CANCELLED' && '❌ Order Cancelled'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
