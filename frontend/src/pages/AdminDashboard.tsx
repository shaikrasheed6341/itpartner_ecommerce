import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import { AdminLayout } from '@/components/AdminLayout'

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
  const { isAuthenticated, isAdmin, token } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login')
    }
  }, [isAuthenticated, isAdmin, navigate])

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
      const response = await fetch('http://localhost:5000/api/products')
      if (response.ok) {
        const data = await response.json()
        // Handle API response format
        if (data.success && Array.isArray(data.data.products)) {
          setProducts(data.data.products)
        } else {
          console.log('API returned non-array data, using empty array')
          setProducts([])
        }
      } else {
        console.log('API failed, using empty array')
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
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data.users)) {
          setUsers(data.data.users)
        } else {
          console.log('API returned non-array data for users')
          setUsers([])
        }
      } else {
        console.log('Users API failed')
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
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
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
    setShowAddForm(true)
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-zinc-900 dark:text-white-100 font-bold text-zinc-900 dark:text-white-100 mb-2">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your products and monitor your store performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Products</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{Array.isArray(products) ? products.length : 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Users</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Orders</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Revenue</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">₹0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Management */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Product Management
              </h2>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setShowAddForm(true)
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          <div className="p-6">
            {!Array.isArray(products) || products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">No products found</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                  Add your first product to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Brand</th>
                      <th className="text-left py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(products) && products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-10 w-10 object-cover rounded mr-3"
                              />
                            )}
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          {product.brand}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          ₹{product.rate}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          {product.quantity || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Product Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                // Handle form submission here
                setShowAddForm(false)
                setEditingProduct(null)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      defaultValue={editingProduct?.name || ''}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      defaultValue={editingProduct?.brand || ''}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.rate || ''}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      defaultValue={editingProduct?.quantity || ''}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      defaultValue={editingProduct?.image_url || ''}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-100"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingProduct(null)
                    }}
                    className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
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
