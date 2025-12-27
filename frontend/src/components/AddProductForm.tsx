import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { productsApi, apiClient } from '@/lib/api'

interface AddProductFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function AddProductForm({ onSuccess, onError }: AddProductFormProps) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    image_url: '',
    quantity: '',
    rate: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Check if admin token exists
    if (!token) {
      const errorMessage = 'Admin authentication required. Please login again.'
      onError?.(errorMessage)
      alert(errorMessage)
      setLoading(false)
      return
    }

    try {
      if (token) apiClient.setAuthToken(token)
      else apiClient.removeAuthToken()

      const response = await productsApi.create({
        name: formData.name,
        brand: formData.brand,
        image_url: formData.image_url || null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        rate: parseFloat(formData.rate)
      })

      if (response?.success) {
        // Reset form
        setFormData({
          name: '',
          brand: '',
          image_url: '',
          quantity: '',
          rate: ''
        })
        
        onSuccess?.()
        alert('Product added successfully!')
      } else {
        const errorMessage = response?.error || 'Failed to add product'
        onError?.(errorMessage)
        alert('Error: ' + errorMessage)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      const errorMessage = 'Failed to connect to server'
      onError?.(errorMessage)
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Add New Product
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Fill in the details below to add a new product to your inventory
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 24-Port Network Switch"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Brand *
            </label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Cisco"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Rate (Price) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.rate}
              onChange={(e) => setFormData({...formData, rate: e.target.value})}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="8500.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/switch.jpg"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding Product...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Product
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                brand: '',
                image_url: '',
                quantity: '',
                rate: ''
              })
            }}
            className="px-6 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  )
}
