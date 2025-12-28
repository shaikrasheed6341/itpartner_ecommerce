import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, Users, ShoppingCart, TrendingUp, DollarSign, ArrowUpRight, Search, Filter } from 'lucide-react'
import { AdminLayout } from '@/components/AdminLayout'
import { productsApi, authApi, apiClient } from '@/lib/api'

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

interface User {
  id: string
  email: string
  fullName: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

export function AdminDashboard() {
  const { isAuthenticated, isAdmin, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    image_url: '',
    quantity: '',
    rate: ''
  })

  // Redirect if not admin
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login')
    }
  }, [isAuthenticated, isAdmin, navigate, authLoading])

  // Fetch data
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts()
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, isAdmin])

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll()

      if (response?.success && Array.isArray(response.data?.products)) {
        setProducts(response.data.products)
      } else if (Array.isArray(response?.data)) {
        setProducts(response.data)
      } else {
        console.log('API returned non-array data, using empty array')
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      if (token) apiClient.setAuthToken(token)
      else apiClient.removeAuthToken()

      const response = await authApi.getAllUsers()
      if (response?.success && Array.isArray(response.data?.users)) {
        setUsers(response.data.users)
      } else if (Array.isArray(response?.data)) {
        setUsers(response.data)
      } else {
        console.log('API returned non-array data for users')
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      if (token) apiClient.setAuthToken(token)
      else apiClient.removeAuthToken()

      const response = await productsApi.delete(productId)

      if (response?.success) {
        setProducts(products.filter(p => p.id !== productId))
        alert('Product deleted successfully')
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      brand: product.brand,
      image_url: product.image_url || '',
      quantity: product.quantity?.toString() || '',
      rate: product.rate.toString()
    })
    setShowAddForm(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        image_url: formData.image_url || undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        rate: parseFloat(formData.rate)
      }

      if (token) apiClient.setAuthToken(token)
      else apiClient.removeAuthToken()

      let response
      if (editingProduct) {
        response = await productsApi.update(editingProduct.id, productData)
      } else {
        response = await productsApi.create(productData)
      }

      if (response?.success) {
        await fetchProducts() // Refresh products list
        resetForm()
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
      } else {
        // if axios-based client throws, it will be caught below
        alert(`Error: ${response?.error || 'Failed to save product'}`)
        if (response?.status === 401 || response?.status === 403) {
          navigate('/admin/login')
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      image_url: '',
      quantity: '',
      rate: ''
    })
    setShowAddForm(false)
    setEditingProduct(null)
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-zinc-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Overview</h1>
            <p className="text-zinc-500 mt-1">Welcome back, Admin. Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value="₹48,290"
            trend="+12.5%"
            isPositive={true}
            icon={<DollarSign className="h-6 w-6 text-white" />}
            gradient="from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Active Orders"
            value="12"
            trend="+4.3%"
            isPositive={true}
            icon={<ShoppingCart className="h-6 w-6 text-white" />}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatsCard
            title="Total Products"
            value={products.length.toString()}
            trend="+2"
            isPositive={true}
            icon={<Package className="h-6 w-6 text-white" />}
            gradient="from-violet-500 to-purple-600"
          />
          <StatsCard
            title="Total Customers"
            value={users.length.toString()}
            trend="+8.1%"
            isPositive={true}
            icon={<Users className="h-6 w-6 text-white" />}
            gradient="from-orange-500 to-pink-600"
          />
        </div>

        {/* Action Bar & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-violet-500 text-zinc-700"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-sm font-medium transition-colors border border-zinc-200/50">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                setShowAddForm(true)
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Products Table section */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h2 className="font-semibold text-zinc-800">Recent Products</h2>
            <button className="text-violet-600 text-sm font-medium hover:text-violet-700">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category/Brand</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {!Array.isArray(products) || products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-300">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 group-hover:text-violet-700 transition-colors">{product.name}</p>
                            <p className="text-xs text-zinc-500">ID: {product.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {product.brand}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-zinc-700">₹{product.rate.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6">
                        {/* Mock Inventory Status Logic */}
                        {(product.quantity || 0) > 5 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            In Stock ({product.quantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Low Stock ({product.quantity || 0})
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1.5 text-zinc-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Product Modal - Styled */}
        {showAddForm && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-100">
              <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={resetForm} className="text-zinc-400 hover:text-zinc-600">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
                      placeholder="e.g. Wireless Headphones"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
                      placeholder="e.g. Sony"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-zinc-500 mt-1">Provide a direct link to the product image.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium transition-all shadow-sm shadow-violet-200 text-sm"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

// Helper Component for Stats Cards
function StatsCard({ title, value, trend, isPositive, icon, gradient }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <h3 className="text-2xl font-bold text-zinc-900 mt-2">{value}</h3>

          <div className="flex items-center mt-2.5 gap-2">
            <div className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
              {trend}
            </div>
            <span className="text-xs text-zinc-400">vs last month</span>
          </div>
        </div>

        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
