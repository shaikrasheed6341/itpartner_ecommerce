import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck, XCircle, Eye, Calendar, CreditCard, User, MapPin, Phone, Mail, Search, Filter, ChevronDown, ChevronUp, MoreVertical, Edit3, ArrowLeft, Ship } from 'lucide-react'

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
  razorpayOrderId: string
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
  user: {
    id: string
    fullName: string
    email: string
    phone: string
    houseNumber: string
    street: string
    area: string
    city: string
    state: string
    pinCode: string
  }
  payments: Array<{
    id: string
    amount: number
    status: string
    paymentMethod: string
    providerPaymentId: string
    createdAt: string
  }>
  summary: {
    totalItems: number
    itemCount: number
    totalAmount: number
  }
}

export function AdminOrders() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Fetch all orders for admin
  useEffect(() => {
    fetchAllOrders()
  }, [])

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      // Note: This endpoint needs to be created in backend to get all orders for admin
      const response = await fetch('http://localhost:5000/api/admin/orders')

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.data.orders)
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
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'SHIPPED':
        return <Truck className="h-4 w-4 text-blue-500" />
      case 'DELIVERED':
        return <Package className="h-4 w-4 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Refresh orders after update
      fetchAllOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const handleShipOrder = (orderId: string) => {
    navigate(`/admin/shipping/${orderId}`)
  }

  const handleBackToDashboard = () => {
    navigate('/admin')
  }

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'amount-high':
        return b.totalAmount - a.totalAmount
      case 'amount-low':
        return a.totalAmount - b.totalAmount
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Confirmed Orders</h1>
                <p className="text-sm text-gray-600 mt-1">Manage and track confirmed customer orders</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'CONFIRMED').length}</div>
                <div className="text-xs text-gray-500">Confirmed Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'CONFIRMED').length}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'SHIPPED').length}
                </div>
                <div className="text-sm text-gray-600">Shipped</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <div className="text-lg font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'CANCELLED').length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, customers, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 pb-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'No orders match your current filters.' 
                : 'No orders have been placed yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Order Header - Compact */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          #{order.orderNumber}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.summary.totalItems} items
                        </p>
                      </div>
                      
                      {/* Status Update Buttons */}
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
                        >
                          <Ship className="h-4 w-4" />
                          <span>Mark as Shipped</span>
                        </button>
                      )}
                      
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
                        >
                          <Package className="h-4 w-4" />
                          <span>Mark as Delivered</span>
                        </button>
                      )}
                      
                      {order.status === 'DELIVERED' && (
                        <div className="bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-center">
                          <div className="flex items-center space-x-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Order Completed</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-xs text-gray-500">
                          <div className="font-medium text-gray-900">{order.user.fullName}</div>
                          <div>{order.user.email}</div>
                        </div>
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {expandedOrder === order.id ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Customer Info */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Customer Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.user.fullName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.user.phone}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div className="text-sm text-gray-600">
                              <div>{order.user.houseNumber}, {order.user.street}</div>
                              <div>{order.user.area}, {order.user.city}</div>
                              <div>{order.user.state} - {order.user.pinCode}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Order Items</h4>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-3 p-2 bg-white rounded border"
                            >
                              <img
                                src={item.product.image_url || '/placeholder-product.jpg'}
                                alt={item.product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.product.brand} • Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  ₹{item.itemTotal.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ₹{item.price.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Management */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm">Order Management</h4>
                        <div className="space-y-3">
                          {/* Status Update Buttons */}
                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2 mb-3"
                            >
                              <Ship className="h-4 w-4" />
                              <span>Mark as Shipped</span>
                            </button>
                          )}
                          
                          {order.status === 'SHIPPED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2 mb-3"
                            >
                              <Package className="h-4 w-4" />
                              <span>Mark as Delivered</span>
                            </button>
                          )}
                          
                          {order.status === 'DELIVERED' && (
                            <div className="w-full bg-green-50 border border-green-200 px-4 py-3 rounded-lg text-center mb-3">
                              <div className="flex items-center justify-center space-x-2 text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Order Completed</span>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Update Status
                            </label>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Subtotal:</span>
                              <span className="text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Shipping:</span>
                              <span className="text-green-600">Free</span>
                            </div>
                            <div className="flex items-center justify-between text-xs border-t border-gray-200 pt-1">
                              <span className="font-medium text-gray-900">Total:</span>
                              <span className="font-medium text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-xs">
                              <CreditCard className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">Payment: {order.paymentMethod || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">Ordered: {formatDate(order.createdAt)}</span>
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
